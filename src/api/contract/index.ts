import axios from 'axios';

import { ApiBaseUrl, buildSamApiUrl } from '../../utils/url';

import {
    Contract,
    ContractQueryMode,
    ContractQueryIndex,
    ContractSearchError,
    ContractSearchOptions, 
    ContractSearchResponse,
    ContractSearchSortOptions,
    ContractSearchApiPaginationData
} from './types';

type ContractSearchApiResponse = {
    _embedded?: {
        results: Contract[]
    }
    _links: {
        [key: string]: {
            href: string
            templated: boolean
        }
    }
    page: ContractSearchApiPaginationData
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

    public async nextPage(pageSize?: number):Promise<ContractSearchResponse> {
        const options = { ...this.options };

        if (this.options.page !== undefined) this.options.page++;
        if (pageSize) options.pageSize = pageSize;

        const res = await ContractSearch.search(options);

        return res;
    }

    public async currentPage(pageSize?: number):Promise<ContractSearchResponse> {
        const options = { ...this.options };

        if (pageSize) options.pageSize = pageSize;

        const res = await ContractSearch.search(options);

        return res;
    }

    public async prevPage(pageSize?: number):Promise<ContractSearchResponse> {
        const options = { ...this.options };

        if (this.options.page !== undefined) this.options.page--;
        if (pageSize) options.pageSize = pageSize;

        const res = await ContractSearch.search(options);

        return res;
    }

    public async list(contracts?: Contract[], pageSize = 1000):Promise<Contract[]> {
        let res: ContractSearchResponse;

        if (!contracts) {
            res = await this.currentPage(pageSize);
            contracts = res.contracts ?? [];
        }

        res = await this.nextPage(pageSize);

        if (res.contracts) {
            const list = contracts.concat(res.contracts);

            if (res.paging) {
                if (list.length >= res.paging.totalElements) {
                    return list;
                }
            }

            return this.list(list);
        }

        return contracts;
    }

    public static async search(options: ContractSearchOptions):Promise<ContractSearchResponse> {
        if (options.page === undefined) options.page = 0;
        if (options.pageSize === undefined) options.pageSize = 25;
        if (options.query instanceof Array) options.query = options.query.join(' ');

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

        const contractSearchData: ContractSearchResponse = {
            paging: {
                size: 0,
                totalElements: 0,
                totalPages: 0,
                number: 0,
                maxAllowedRecords: 0,
            }
        };

        const samApiData = <ContractSearchApiResponse> res.data;

        if (res.status === 200) {
            if (!samApiData?._embedded) {
                contractSearchData.contracts = [];
            } else {
                contractSearchData.contracts = samApiData._embedded.results;
            }

            if (samApiData.page.totalElements !== 0) {
                contractSearchData.paging = samApiData.page;
            }

        } else {
            contractSearchData.error = <ContractSearchError> res.data;
        }

        return contractSearchData;
    }
}