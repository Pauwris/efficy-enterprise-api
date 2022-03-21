Insert and commit a new document. Add relations with Contacts, Companies, Products. Activate and update a category. Set linked users and a unique reference.

```javascript
const crm = new CrmRpc(crmEnv);

const docu = crm.openEditObject("docu", 0);
docu.updateField("NAME", "Hello from Node.js");
docu.insertDetail("Comp", 2);
docu.insertDetail("Cont", 44395, true, true);
docu.commitChanges();
docu.activateCategory("DOCU$INVOICING");
docu.updateCategoryFields("DOCU$INVOICING", {
	"D_INVOICE":"2021-01-08T00:00:00",
	"COMMUNICATION": "Hello World!"
});
docu.updateCategoryField("DOCU$INVOICING", "PRE_PAID", 123.456)
docu.clearDetail("Comp");
docu.insertDetail("Comp", 4);
docu.insertDetail("Cont", 50512, false);
docu.insertDetail("Prod", 4);
docu.updateDetail("Prod", 0, {
	QUANTITY: 5
});
docu.setUsers([169, 170], true);
docu.setUserSecurity(99999002, 271);
docu.setReference(99999001);
docu.commitChanges();
docu.closeContext();
await crm.executeBatch();
```