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

export type ContractSearchError = {
    timestamp: Date
    status: number
    error: string
    path: string
}

export type ContractSearchApiPaginationData = {
    size: number
    totalElements: number
    totalPages: number
    number: number
    maxAllowedRecords: number
}

export type ContractSearchResponse = {
    contracts?: Contract[]
    error?: ContractSearchError
    paging?: ContractSearchApiPaginationData
}

export type ContractSearchOptions = {
    page?: number
    pageSize?: number
    query: string | string[]
    queryMode: ContractQueryMode
    index?: ContractQueryIndex
    active?: boolean
    sort?: ContractSearchSortOptions
    organizationId?: string
}