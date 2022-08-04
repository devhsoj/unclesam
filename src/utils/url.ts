export enum ApiBaseUrl {
    contracts = 'https://sam.gov/api/prod/sgs/v1'
}

export function buildSamApiUrl(baseUrl: ApiBaseUrl, uri: string, query?: { [key: string]: string }):string {
    if (uri.includes('?')) uri = uri.split('?')[0];

    const url = new URL(baseUrl + uri);

    if (!query) {
        return url.href;
    }

    for (const param in query) {
        url.searchParams.append(param, query[param]);
    }

    return url.href;
}
