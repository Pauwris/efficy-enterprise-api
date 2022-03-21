Usage examples of the availabel Query and Search operations

```javascript
const tags = crm.executeDatabaseQuery(99990034); // query "Standard: Top company tags"
const contDupls = crm.executeSystemQuery(4, 1, [11000,2]); // System query "Own Duplicate List"
const appos = crm.executeSqlQuery("Select * from ACTIONS where PLANNED=:p1 and DONE=:p2", ["1", "0"], true, 2);

const compSearch = crm.search("comp", "SEARCHFAST", "Efficy");
const contactsByEmail = crm.searchContactsByEmail(["john.doe@efficy.com", "john.doe@outlook.com"]);
const contactsByPhone = crm.searchContactsByPhone("+32 470 00 00 00");

await crm.executeBatch();

// After the batch is executed, each constant is a object of type DataSetObject
console.log(tags.items) // Array of items
console.log(tags.items) // First item of array of items
```

See [DataSetObject](DataSetObject.html)
