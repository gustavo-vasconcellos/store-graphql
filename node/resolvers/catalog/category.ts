import { compose, last, prop, split, find } from 'ramda'
import { toIOMessage } from '../../utils/ioMessage'
const lastSegment = compose<string, string[], string>(last, split('/'))

interface Category {
  id: string,
  url: string,
  children: any[],
}

export const resolvers = {
  Category: {
    cacheId: prop('id'),

    href: async ({ id }, _, { dataSources: { catalog } }) => {
      const categories = await catalog.categories(3) as Category[]

      const flattenCategories = categories.reduce(
        (acc : Category[], category) => acc.concat(category, category.children),
        []
      )

      const category = find(
        (c : Category) => c.id === id,
        flattenCategories
      ) || { url: '' }

      return category.url.replace(
        /https:\/\/[A-z0-9]+\.vtexcommercestable\.com\.br/,
        ''
      )
    },

    metaTagDescription: prop('MetaTagDescription'),

    name: ({name}, _, ctx) => toIOMessage(ctx, name),

    slug: async ({ id }, _, { dataSources: { catalog } }) => {
      const categories = await catalog.categories(3) as Category[]

      const flattenCategories = categories.reduce(
        (acc : Category[], category) => acc.concat(category, category.children),
        []
      )

      const category = find(
        (c : Category) => c.id === id,
        flattenCategories
      ) || { url: '' }

      return category.url ? lastSegment(category.url) : null
    },

    titleTag: prop('Title'),
  }
}
