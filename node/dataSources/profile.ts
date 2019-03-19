import { HttpClient, InstanceOptions, IOContext, IODataSource } from '@vtex/api'
import * as queryStringBuilder from 'qs'

export class ProfileDataSource extends IODataSource {
  protected httpClientFactory = forLegacy

  constructor(ctx?: IOContext, opts?: InstanceOptions) {
    super(ctx, opts)
  }

  public getProfileInfo = (userEmail: string, customFields?: string) => {
    const queryString = queryStringBuilder.stringify({
      extraFields: customFields,
    })

    return this.http.get(
      `${userEmail}/personalData${queryString ? `?${queryString}` : ''}`,
      {
        headers: withHeadersFromContext(this.context),
        metric: 'profile-system-getProfileInfo',
      }
    )
  }

  public getUserAddresses = (userEmail: string) => {
    return this.http.get(`${userEmail}/addresses`, {
      headers: withHeadersFromContext(this.context),
      metric: 'profile-system-getUserAddresses',
    })
  }

  public getUserPayments = (userEmail: string) => {
    return this.http.get(`${userEmail}/vcs-checkout`, {
      headers: withHeadersFromContext(this.context),
      metric: 'profile-system-getUserPayments',
    })
  }

  public updateProfileInfo = (
    userEmail: string,
    profile: Profile | { profilePicture: string },
    customFields?: string
  ) => {
    const queryString = queryStringBuilder.stringify({
      extraFields: customFields,
    })

    return this.http.post(
      `${userEmail}/personalData${queryString ? `?${queryString}` : ''}`,
      profile,
      {
        headers: withHeadersFromContext(this.context),
        metric: 'profile-system-updateProfileInfo',
      }
    )
  }

  public updateAddress = (userEmail: string, addressesData) => {
    return this.http.post(`${userEmail}/addresses`, addressesData, {
      headers: withHeadersFromContext(this.context),
      metric: 'profile-system-updateAddress',
    })
  }

  public deleteAddress = (userEmail: string, addressName: string) => {
    return this.http.delete(`${userEmail}/addresses/${addressName}`, {
      headers: withHeadersFromContext(this.context),
      metric: 'profile-system-deleteAddress',
    })
  }
}

function withHeadersFromContext(context: IOContext | undefined) {
  const { account = '', authToken = '' } = context || {}

  return {
    'Proxy-Authorization': authToken,
    VtexIdClientAutCookie: authToken,
    'X-Vtex-Proxy-To': `http://${account}.vtexcommercestable.com.br`,
  }
}

function forLegacy({ options, context }) {
  const { account = '' } = context || {}
  const baseURL = `http://${account}.vtexcommercestable.com.br/api/profile-system/pvt/profiles`

  return HttpClient.forLegacy(baseURL, options || ({} as any))
}
