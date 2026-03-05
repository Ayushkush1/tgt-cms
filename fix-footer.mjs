import { readFileSync, writeFileSync } from "fs";

const path = "src/app/static-pages/components/FooterCMS.tsx";
let code = readFileSync(path, "utf-8");

// regex replacement for the default inputs that were previously hardcoded on the UI components themselves in the JSX
code = code.replace(/defaultValue="THE GOLD TECHNOLOGIES"/g, '');
code = code.replace(/defaultValue="GT"/g, '');
code = code.replace(/defaultValue="Empowering visionaries with cutting-edge digital solutions. We turn complex challenges into elegant, scalable technology."/g, '');
code = code.replace(/defaultValue="INDIA"/g, '');
code = code.replace(/defaultValue="SD-369, D block, Shastri Nagar, Ghaziabad, Uttar Pradesh, India - 201002"/g, '');
code = code.replace(/defaultValue="USA"/g, '');
code = code.replace(/defaultValue="Accessible minds 1309- Coffeen Avenue, STE 1200 Sheridan Wyoming- 82801, USA"/g, '');
code = code.replace(/defaultValue="\+91 8368198551"/g, '');
code = code.replace(/defaultValue="info@thegoldtechnologies\.com"/g, '');
code = code.replace(/defaultValue="THE"/g, '');
code = code.replace(/defaultValue="NOLOGIES"/g, '');
code = code.replace(/defaultValue="GOLD TECH"/g, '');

writeFileSync(path, code);
console.log("Cleared React props default data");
