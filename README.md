# unclesam
unclesam is an unofficial TypeScript API built for querying [sam.gov](https://sam.gov). This package allows you to quickly & easily retrieve government contracts via a modern, typed API.

## How to install
---
Requirements: [node/npm](https://nodejs.org/)

```sh
cd my_project/
npm i @devhsoj/unclesam
```

## Examples
---
### Querying active contracts matching all words
```ts
import { ContractSearch, ContractQueryMode } from 'unclesam';

(async () => {
    const search = new ContractSearch({
        query: ['software', 'network'],
        queryMode: ContractQueryMode.ALL,
        pageSize: 1000,
        active: true
    });

    // .list() goes through each page recursively (in this case, 1000 records at a time) and returns all contracts
    const contracts = await search.list();

    console.log(contracts); // [{ title: 'Example Title', ... }]
})();
```

### Explicitly retrieve the ten most recently modified contract opportunities containing the word 'defense'

```ts
import { ContractSearch, ContractQueryMode, ContractQueryIndex, ContractSearchSortOptions } from 'unclesam';

(async () => {
    // Using the static class method .search() on ContractSearch, allows you to directly search contracts
    const res = await ContractSearch.search({
        page: 0,
        pageSize: 10,
        query: 'defense',
        active: true,
        queryMode: ContractQueryMode.EXACT,
        index: ContractQueryIndex.Opportunities,
        sort: ContractSearchSortOptions.dateModifiedDesc
    });

    // If there is an error on the sam.gov API, output the error
    if (res.error) {
        console.trace(res.error);
    } else {
        if (!res.contracts || res.contracts?.length === 0) {
            console.log('No contracts found!');
        } else {
            console.log(res.contracts);
        }
    }
})();
```

## About
---

This project was created to get more of an understanding of creating a library in TypeScript :)

*Plus I like reverse-engineering APIs*