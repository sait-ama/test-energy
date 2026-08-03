import { fileURLToPath } from "node:url";

import fs from "fs";
import camelCase from "lodash.camelcase";
import upperFirst from "lodash.upperfirst";
import path from "path";

const kebabToPascal = (str) => upperFirst(camelCase(str));

const __filename = fileURLToPath(import.meta.url);
const __dirnamePath = path.dirname(__filename);

const iconsDir = path.join(
  __dirnamePath,
  "..",
  "..",
  "..",
  "packages",
  "ui",
  "src",
  "icons",
);
const outputFile = path.join(
  __dirnamePath,
  "..",
  "src",
  "stories",
  "Iconography.mdx",
);

fs.readdir(iconsDir, (err, files) => {
  if (err) {
    console.error("Error reading icons directory:", err);
    return;
  }

  const iconFiles = files.filter((file) =>
    [".js", ".jsx", ".ts", ".tsx"].includes(path.extname(file)),
  );

  const importStatements = iconFiles
    .map((file) => {
      const fileName = path.basename(file, path.extname(file));
      const componentName = kebabToPascal(fileName);
      return `import ${componentName} from '@re/ui-kit/icons/${fileName}';`;
    })
    .join("\n");

  const iconEntries = iconFiles
    .map((file) => {
      const fileName = path.basename(file, path.extname(file));
      const componentName = kebabToPascal(fileName);
      return `    ${componentName},`;
    })
    .join("\n");

  const tsxContent = `import { IconGallery, Meta, IconItem } from '@storybook/blocks';

${importStatements}

<Meta title="Iconography/Icon Gallery" />

<IconGallery>
  {Object.entries({
${iconEntries}
  }).map(([name, IconComponent]) => (
    <IconItem key={name} name={name}>
      <IconComponent />
    </IconItem>
  ))}
</IconGallery>
`;

  fs.writeFile(outputFile, tsxContent.trim(), (err) => {
    if (err) {
      console.error("Error writing Iconography.stories.tsx:", err);
      return;
    }
    console.log("Iconography.stories.tsx generated successfully!");
  });
});
