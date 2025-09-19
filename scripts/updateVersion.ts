import fs from "fs";
import path from "path";
import "dotenv/config";

type VersionType = "major" | "minor" | "patch";

function bumpVersion(version: string, type: VersionType): string {
    const [major, minor, patch] = version.split(".").map(Number);

    switch (type) {
        case "major":
            return `${major + 1}.0.0`;
        case "minor":
            return `${major}.${minor + 1}.0`;
        case "patch":
            return `${major}.${minor}.${patch + 1}`;
    }
}

async function updateVersion(type: VersionType) {
    const packagePath = path.join(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    const oldVersion = pkg.version;
    const newVersion = bumpVersion(oldVersion, type);
    pkg.version = newVersion;

    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + "\n");
    console.log(`✅ Versão atualizada de ${oldVersion} para ${newVersion}`);
}

const type = process.argv[2] as VersionType;

if (!["major", "minor", "patch"].includes(type)) {
    console.error("Erro: informe 'major', 'minor' ou 'patch'");
    process.exit(1);
}

updateVersion(type);