//@ts-check
global.applicationName = "efficy-enterprise-api";
import fs from 'fs';
import { CrmEnv, CrmRpc} from "./lib/index.mjs";

function logger(msg, reqLog) {
	console.log(msg);
}
/**
 * Processed 200 items with 8 threads in 21.463 seconds
 * Processed 200 items with 6 threads in 20.623 seconds
 * Processed 200 items with 4 threads in 21.44 seconds
 * Processed 200 items with 3 threads in 23.563 seconds
 * Processed 200 items with 2 threads in 25.661 seconds
 * Processed 200 items with 1 threads in 42.376 seconds
 */
async function multiThreadedUnitTest() {
	const itemCount = 200;
	const stackList = Array.from(Array(itemCount).keys()).map(i => {return {id: i}}) // [{id: 0}, {id: 1}, {id: 2}, ... {id: itemCount - 1}]
	const threads = 3;

	const parallelSession = async function(threadId) {
		var item;

		const crmEnv = new CrmEnv({
			"url": "http://efficy120/",
			"customer": "efficy120",
			"apiKey": "86E353284C0C4A848F7ADEA13589C8B6"
		});

		const crm = new CrmRpc(crmEnv);

		item = stackList.pop(); // LIFO (last in first out)
		while (item !== undefined) {
			const task = crm.openEditObject("acti", 0);
			task.updateField("SUBJECT", `multiThreadedUnitTest ${item.id} [${threadId}]`);
			task.updateFields({
				"PLANNED": "0"
			})
			task.insertDetail("Comp", 1133);
			task.closingCommit();
			await crm.executeBatch();
			console.log(`${item.id} - ${crm.sessionId} - acti/${task.key}`);
			item = stackList.pop();
		}

		crm.logoff();
		await crm.executeBatch();
	}

	const parallelSessions = Array.from(Array(threads).keys()).map(threadId => {
		return parallelSession(threadId); // Processed with 5 threads in 10.915 seconds
	})

	const dStart = new Date();
	await Promise.all(parallelSessions);
	const dEnd = new Date();
	console.log(`Processed ${itemCount} items with ${threads} threads in ${(dEnd.getTime() - dStart.getTime()) / 1000} seconds`)
}

async function singleThreadUnitTest() {
	const crmEnv = new CrmEnv({
		"url": "http://efficy120/",
		"customer": "efficy120",
		"apiKey": "86E353284C0C4A848F7ADEA13589C8B6",
		"logOff": false,
		"user": "",
		"pwd": ""
	});

	const crm = new CrmRpc(crmEnv, logger);
	const compCategories = crm.getCategoryCollection("comp");
	const morningMeetings = crm.consultManyEx("Acti", ["PLANNED", "D_BEGIN"], ["1", "2022-03-14 09:00:00"], "D_BEGIN");

	const settings = crm.getSystemSettings();
	const workingPeriodFrom = crm.getSetting("user", "WorkingPeriodFrom");
	const workingPeriodFromFloat = crm.getSetting("user", "WorkingPeriodFrom", false);
	const compRecents = crm.consultRecent("Comp");
	const compRecentsEx = crm.consultRecent("Comp", ["CITY", "COUNTRY"]);
	const compFavorites = crm.consultFavorites("Comp");
	const userList = crm.getUserList();
	await crm.executeBatch();

	// https://nodejs.org/api/buffer.html#buffer
	const path = "Efficy - Invoicing Module.pdf";
	const filePath = "C:/temp/Efficy - Invoicing Module.pdf";
	const base64String = fs.readFileSync(filePath, { flag: 'r' }).toString('base64');

	const attach = crm.openEditObject("docu", 229);
	const dsAttach = attach.getMasterDataSet();
	const dsAttachInvo = attach.getCategoryDataSet("DOCU$INVOICING");
	const files = attach.getDetailDataSet("file");
	await crm.executeBatch();

	const document = crm.openEditObject("docu", 0);
	await crm.executeBatch();
	const dsFiles = document.getDetailDataSet("file", "", false);
	await crm.executeBatch();

	const file = files.item;
	// @ts-ignore
	const attachment = await attach.getAttachment(file.K_FILE, file.VERSION);
	await crm.executeBatch();

	const exportPath = "C:/temp/Efficy - Invoicing Module_saved.pdf";
	fs.writeFileSync(exportPath, Buffer.from(attachment.base64Stream, 'base64'));
	attach.updateField("NAME", "File with max 7 attachments");
	attach.insertAttachment(crm.constants.file_type.embedded, path);
	attach.updateAttachment(0, base64String);
	await crm.ws.cleanupFiles(attach, "", 7);
	await crm.ws.cleanupFiles(attach, `COMMENT like '%template%'`, 0);
	attach.closingCommit();
	await crm.executeBatch();

	const comp = crm.openConsultObject("comp", 2);
	const dsComp = comp.getMasterDataSet();
	const dsCompAddress = comp.getCategoryDataSet("COMP$ADDRESS");
	await crm.executeBatch();
	const companyNames = [comp.data.master.NAME, comp.data.category["COMP$ADDRESS"].NAME];
	const compCopy = crm.getConsultObject(comp.consulthandle, "Comp");
	const linkedContacts = compCopy.getDetailDataSet("cont");
	compCopy.closeContext();

	const docu = crm.openEditObject("docu", 0);
	docu.updateField("NAME", "Jan");
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

	crm.deleteEntity("docu", []);
	crm.deleteEntity("docu", docu.key);

	const task = crm.openEditObject("acti", 0);
	task.updateField("SUBJECT", "Demo Task");
	task.updateFields({
		"MEMO": "Hello",
		"PLANNED": "0"
	})
	task.insertDetail("Comp", 2);
	task.closingCommit();

	const appo = crm.openEditObject("acti", 0);
	appo.updateField("SUBJECT", "appoCopy");
	appo.updateFields({
		"PLANNED": "1"
	})
	await crm.executeBatch();
	appo.insertDetail("Comp", 2);

	const appoCopy = crm.getEditObject(appo.edithandle);
	appoCopy.insertDetail("Comp", 1129);
	appoCopy.closingCommit();

	const duplicatedTask = crm.openEditObject("Acti", 0);
	duplicatedTask.getMasterDataSet();
	duplicatedTask.getDetailDataSet("Cont");
	duplicatedTask.copyFromExisting(3501);
	await crm.executeBatch();
	duplicatedTask.updateField("SUBJECT", "Copy of " + duplicatedTask.data.master["SUBJECT"]);
	duplicatedTask.closingCommit();

	const tags = crm.executeDatabaseQuery(99990034); // query "Standard: Top company tags"
	const compSearch = crm.search("comp", "SEARCHFAST", "Efficy");
	const contactsByEmail = crm.searchContactsByEmail(["john.doe@efficy.com", "john.doe@outlook.com"]);
	const contactsByPhone = crm.searchContactsByPhone("+32 470 00 00 00");
	const contDupls = crm.executeSystemQuery(4, 1, [11000,2]); // System query "Own Duplicate List"
	const appos = crm.executeSqlQuery("Select * from ACTIONS where PLANNED=:p1 and DONE=:p2", ["1", "0"], true, 2);
	await crm.executeBatch();

	crm.logoff();
	await crm.executeBatch();

	console.log(JSON.stringify(compCategories.items));
	console.log(JSON.stringify(morningMeetings.items));
	console.log(JSON.stringify(attach));
	console.log(JSON.stringify(dsAttach.item));
	console.log(JSON.stringify(dsAttachInvo.item));

	console.log(JSON.stringify(comp));
	console.log(JSON.stringify(dsComp.item));
	console.log(JSON.stringify(dsCompAddress.item));

	console.log(JSON.stringify(docu));
	console.log(JSON.stringify(task));
	console.log(JSON.stringify(appo));
	console.log(JSON.stringify(tags.items));
	console.log(JSON.stringify(compSearch.items));
	console.log(JSON.stringify(contactsByEmail.items));
	console.log(JSON.stringify(contactsByPhone.items));

	console.log(JSON.stringify(contDupls.items));
	console.log(JSON.stringify(appos.items));
	console.log(JSON.stringify(compRecents.items));
	console.log(JSON.stringify(compRecentsEx.items));
	console.log(JSON.stringify(compFavorites.items));
	console.log(JSON.stringify(userList.items));
	console.log(settings.map.get("ShortDateFormat"));
	console.log(workingPeriodFrom.result);
	console.log(workingPeriodFromFloat.result);

	console.log('[PASS] all tests pass');
}

async function useDotEnv() {
	const crmEnv = new CrmEnv();
	const crm = new CrmRpc(crmEnv, logger);

	const compSearch = crm.search("comp", "SEARCHFAST", "Efficy");

	crm.logoff();
	await crm.executeBatch();

	console.log(compSearch.items);

	console.log('[PASS] all tests pass');
}

const main = async function() {
	//await multiThreadedUnitTest();
	await singleThreadUnitTest()
	//await useDotEnv();
};

// @ts-ignore
await main();
