import { ApiBaseUrl, buildSamApiUrl } from '../../utils/url';
import axios from 'axios';

export enum ContractSearchSortOptions {
    titleAsc = 'title',
    titleDesc = '-title',
    moreRelevant = '-relevance',
    lessRelevant = 'relevance',
    alNumberAsc = 'programNumber',
    alNumberDesc = '-programNumber',
    dateModifiedAsc = 'modifiedDate',
    dateModifiedDesc = '-modifiedDate'
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
    _embedded?: {
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
    error: string
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
    queryMode: ContractQueryMode
    index?: ContractQueryIndex
    active?: boolean
    sort?: ContractSearchSortOptions
    organizationId?: string
}

/**
 * Query mode for querying contracts.
 */
export enum ContractQueryMode {
    /** Search results will contain one, some, or all keywords entered. */
    ANY = 'ANY',
    /** Search results will contain all keywords entered. */
    ALL = 'ALL',
    /** Search results will contain the EXACT PHRASE from the keyword search. */
    EXACT = 'EXACT'
}

/**
 * Index to use for querying contracts.
 */
export enum ContractQueryIndex {
    /** Search results will contain all contracts. */
    All = '_all',
    /** Search results will contain only "Opportunities" */
    Opportunities = 'opp',
    /** Search results will contain only "Assitance Listings" */
    AssistanceListings = 'cfda'
}

type ContractSearchQuery = {
    page: string
    size: string
    mode: 'search'
    q: string
    qMode: ContractQueryMode
    index?: ContractQueryIndex
    is_active?: string
    sort?: ContractSearchSortOptions
    organization_id?: string
}

export class ContractSearch {
    options: ContractSearchOptions;

    constructor(options: ContractSearchOptions) {
        this.options = options;

        if (!this.options.page) this.options.page = 0;
        if (!this.options.pageSize) this.options.pageSize = 25;
    }

    public async nextPage():Promise<ContractSearchResponse> {
        try {
            if (this.options.page !== undefined) this.options.page++;

            const res = await ContractSearch.search(this.options);

            return Promise.resolve(res);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public async currentPage():Promise<ContractSearchResponse> {
        try {
            const res = await ContractSearch.search(this.options);

            return Promise.resolve(res);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public async prevPage():Promise<ContractSearchResponse> {
        try {
            if (this.options.page !== undefined) this.options.page--;

            const res = await ContractSearch.search(this.options);

            return Promise.resolve(res);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public static async search(options: ContractSearchOptions):Promise<ContractSearchResponse> {
        try {
            if (options.page === undefined) options.page = 0;
            if (options.pageSize === undefined) options.pageSize = 25;

            const query: ContractSearchQuery = {
                page: options.page.toString(),
                size: options.pageSize.toString(),
                mode: 'search',
                q: options.query,
                qMode: options.queryMode
            };

            if (options.index) query.index = options.index;
            if (options.active) query.is_active = options.active.toString();
            if (options.organizationId) query.organization_id = options.organizationId;

            const res = await axios.get(
                buildSamApiUrl(ApiBaseUrl.contracts, '/search', query),
                { validateStatus: null }
            );
    
            const data: ContractSearchResponse = {};
            const samData = (<ContractSearchApiResponse> res.data);

            if (res.status === 200) {
                if (!samData?._embedded) {
                    data.contracts = [];
                } else {
                    data.contracts = samData._embedded.results;
                }
            } else {
                data.error = <ContractSearchError> res.data;
            }
    
            return Promise.resolve(data);
        } catch (err) {
            return Promise.reject(err);
        }
    }
}