const { execSync } = require('child_process');
const path = require('path');

function runScript(scriptName) {
	const scriptPath = path.join(__dirname, scriptName);
	console.log(`\n--- Running ${scriptName} ---`);
	execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
}

try {
	runScript('extract-theme-from-html.js');
	runScript('collect-stock-code-by-theme.js');
	runScript('add-theme-to-excel.js');
	console.log('\n✅ All theme scripts completed successfully!');
} catch (error) {
	console.error('\n❌ Error during theme pipeline execution:', error);
}
