import { map, toPairs } from 'ramda'
import { toIOMessage } from '../../utils/ioMessage'

const objToNameValue = (keyName: string, valueName: string, record: Record<string, any>) => map(
  ([key, value]) => ({ [keyName]: key, [valueName]: value }),
  toPairs(record)
)

export const resolvers = {
  Facet: {
    Name: ({Name}: any, _: any, ctx: Context) => toIOMessage(ctx, Name),
  },
  Facets: {
    SpecificationFilters: ({SpecificationFilters = {}}) => objToNameValue('name', 'facets', SpecificationFilters),
  },
}
