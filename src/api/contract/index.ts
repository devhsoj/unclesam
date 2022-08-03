import { ApiBaseUrl, buildSamApiUrl } from '../../utils/url';
import axios from 'axios';

export enum ContractSearchSortOptions {
    dateModifiedDesc = '-modifiedDate',
    dateModifiedAsc = 'modifiedDate'
}

export type ContractAssistanceTypeRecord = {
    elementId: string
    code: string
    level: number
    value: string
}

export type ContractAssistantType = {
    hierarchy: ContractAssistanceTypeRecord[]
}

export type ContractHistoricalRecord = {
    organizationId: string
    actionType: string
    createdDate: Date
    isManual: boolean
    index: number
    historicalIndexId: string
    body: string
    fiscalYear: number
    statusCode: string
}

export type ContractOrganization = {
    organizationId: string
    level: number
    name: string
    status: string
}

export type Contract = {
    _id: string
    _rScore: number
    _type: string
    fhNames: null
    isActive: boolean
    isFunded: boolean
    isCanceled: boolean
    publishDate: Date
    modifiedDate: Date
    title: string
    objective: string
    descriptions: string[]
    programNumber: string
    organizationHierarchy: ContractOrganization[]
    historicalIndex: ContractHistoricalRecord[]
    assistanceTypes: ContractAssistantType[]
}

export type ContractSearchApiResponse = {
    _embedded: {
        results: Contract[]
    }
    _links: {
        [key: string]: {
            href: string
            templated: boolean
        }
    }
    page: {
        size: number
        totalElements: number
        totalPages: number
        number: number
        maxAllowedRecords: number
    }
}

export type ContractSearchError = {
    timestamp: Date
    status: number
    error: string,
    path: string
}

export type ContractSearchResponse = {
    contracts?: Contract[]
    error?: ContractSearchError
}

export type ContractSearchOptions = {
    page?: number
    pageSize?: number
    query: string
    active: boolean
    sort: ContractSearchSortOptions
}

export class ContractSearcher {
    options: ContractSearchOptions;

    constructor(options: ContractSearchOptions) {
        this.options = options;

        if (!this.options.page) this.options.page = 0;
        if (!this.options.pageSize) this.options.pageSize = 25;
    }

    public async nextPage():Promise<ContractSearchResponse> {
        try {
            const res = await ContractSearcher.search(this.options);

            if (this.options.page) this.options.page++;

            return Promise.resolve(res);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public async currentPage():Promise<ContractSearchResponse> {
        try {
            const res = await ContractSearcher.search(this.options);

            return Promise.resolve(res);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public async prevPage():Promise<ContractSearchResponse> {
        try {
            if (this.options.page) this.options.page--;

            const res = await ContractSearcher.search(this.options);

            return Promise.resolve(res);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public static async search(options: ContractSearchOptions):Promise<ContractSearchResponse> {
        try {
            const res = await axios.get(
                buildSamApiUrl(
                    ApiBaseUrl.contracts,
                    '/search',
                    {
                        page: options.page,
                        size: options.pageSize,
                        mode: 'search',
                        q: options.query,
                        qMode: 'ALL',
                        is_active: options.active
                    }
                ), { validateStatus: null });
    
            const data: ContractSearchResponse = {};

            if (res.status === 200) {
                data.contracts = (<ContractSearchApiResponse> res.data)._embedded.results;
            } else {
                data.error = <ContractSearchError> res.data;
            }
    
            return Promise.resolve(data);
        } catch (err) {
            return Promise.reject(err);
        }
    }
}