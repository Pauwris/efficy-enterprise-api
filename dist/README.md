<img src="assets/efficy-crm-logo.svg" style="width:18rem">

# Efficy Enterprise API browser

This is an auto-generated [rollup](https://rollupjs.org/guide/en/) bundled JS package of [efficy-enterprise-api](https://www.npmjs.com/package/efficy-enterprise-api) package for usage in the browser, more specific inside a Efficy Enterprise customization project.

See [Full documentation](https://pauwris.github.io/efficy-enterprise-api/)

Github source and Node.js back-end package:
- Github source of [efficy-enterprise-api](https://github.com/Pauwris/efficy-enterprise-api)
- The Node.js back-end [efficy-enterprise-api](https://www.npmjs.com/package/efficy-enterprise-api) package

## Efficy in browser instructions

Inside your Efficy Enterprise, running in the browser

```powershell
npm i efficy-enterprise-api-browser
```

```javascript
const {CrmRpc} = await import('../../../node_modules/efficy-enterprise-api-browser/es.js');
const crm = new CrmRpc();

const proposal = crm.openEditObject("docu", 0);
proposal.updateFields({
	"NAME": "Non committed proposal",
	"MEMO": "Line1\nLine2"
});
proposal.insertDetail("Oppo", Model("key"));
proposal.insertDetail("Comp", Model("K_COMPANY"));
proposal.insertDetail("Cont", Model("K_CONTACT"));
await crm.executeBatch();

// Debug output
proposal.edithandle; // The editHandle number, can be used to open an edit page
```

----------
(2022) authored by Kristof Pauwels