import http from 'axios'
import paths from '../paths'
import {zipObj, mergeAll, union} from 'ramda'
import { withAuthToken, withMDPagination, headers } from '../headers'

/**
 * Map a document object to a list of {key: 'property', value: 'propertyValue'}.
 */
const mapKeyValues = (document) => Object.keys(document).map(key => ({
  key,
  value: document[key],
}))

/*
 * Convert a list of fields like [ {key: 'propertyName', value: 'String'}, ... ]
 * to a JSON format.
 */
const parseFieldsToJson = (fields) => mergeAll(
  fields.map(field => zipObj([field.key], [field.value])),
)

export const queries = {
  documents: async (_, args, { vtex: ioContext, request: {headers: {cookie}}}) => {
    const {acronym, fields, start, pageSize} = args
    const fieldsWithId = union(fields, ['id'])
    const url = paths.searchDocument(ioContext.account, acronym, fieldsWithId)
    const {data} = await http.get(url, {headers: withMDPagination()(ioContext, cookie)(start, pageSize)})
    return data.map(document => ({
      id: document.id,
      fields: mapKeyValues(document),
    }))
  },

  document: async (_, args, { vtex: ioContext, request: {headers: {cookie}}}) => {
    const {acronym, fields, id} = args
    const url = paths.documentFields(ioContext.account, acronym, fields, id)
    const {data} = await http.get(url, {headers: withAuthToken()(ioContext, cookie)})
    return {id: data.id, fields: mapKeyValues(data)}
  },
}

export const mutations = {
  createDocument: async (_, args, { vtex: ioContext, request: {headers: {cookie}}}) => {
    const {acronym, document: {fields}} = args
    const url = paths.documents(ioContext.account, acronym)
    const {data: {Id, Href, DocumentId}} = await http.post(
      url, parseFieldsToJson(fields),
      {
        headers: {
          Accept: 'application/vnd.vtex.ds.v10+json',
          Authorization: ioContext.authToken,
          ['Content-Type']: 'application/json',
        },
      },
    )
    return {id: Id, href: Href, documentId: DocumentId}
  },

  updateDocument: async (_, args, { vtex: ioContext, request: {headers: {cookie}}}) => {
    const {acronym, document: {fields}} = args
    const url = paths.documents(ioContext.account, acronym)
    const {data: {Id, Href, DocumentId}} = await http.patch(
      url, parseFieldsToJson(fields),
      {
        headers: {
          Accept: 'application/vnd.vtex.ds.v10+json',
          Authorization: ioContext.authToken,
          ['Content-Type']: 'application/json',
        },
      },
    )
    return {id: Id, href: Href, documentId: DocumentId}
  },
}
