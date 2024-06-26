const { getFilesNotOwnedByCodeOwner, findCodeOwnersForChangedFiles, githubLoginIsInCodeowners, hasValidLgtmSubstring } = require(".");

test("determine who owns a set of files", () => {
  const noFiles = findCodeOwnersForChangedFiles(["root-codeowners/one.two.js"], "./test-code-owners-repo");
  expect(noFiles.users).toEqual(["@two"]);

  const filesNotInCodeowners = findCodeOwnersForChangedFiles(["root-codeowners/one.two.ts"], "./test-code-owners-repo");
  expect(filesNotInCodeowners.users).toEqual([]);
});

test("real world", () => {
  const changed = ["/packages/tsconfig-reference/copy/pt/options/files.md"];
  const filesNotInCodeowners = findCodeOwnersForChangedFiles(changed, ".");
  expect(filesNotInCodeowners.users).toEqual(["@khaosdoctor", "@danilofuchs", "@orta"]);
});

test("real world 2", () => {
  const changed = ["/packages/typescriptlang-org/src/copy/pt/index.ts", "/packages/typescriptlang-org/src/copy/pt/nav.ts"];
  const filesNotInCodeowners = findCodeOwnersForChangedFiles(changed, ".");
  expect(filesNotInCodeowners.users).toEqual(["@khaosdoctor", "@danilofuchs", "@orta"]);
});

test("real world with labels", () => {
  // spanish has [] labels in the CODEOWNERS
  const changed = ["/packages/typescriptlang-org/src/copy/es/index.ts", "/packages/typescriptlang-org/src/copy/es/nav.ts"];
  const filesNotInCodeowners = findCodeOwnersForChangedFiles(changed, ".");
  expect(filesNotInCodeowners.labels).toEqual(["translate", "es"]);
});

test("deciding if someone has access to merge", () => {
  const noFiles = getFilesNotOwnedByCodeOwner("@two", ["root-codeowners/one.two.js"], "./test-code-owners-repo");
  expect(noFiles).toEqual([]);

  const filesNotInCodeowners = getFilesNotOwnedByCodeOwner("@two", ["random-path/file.ts"], "./test-code-owners-repo");
  expect(filesNotInCodeowners).toEqual(["random-path/file.ts"]);
});

describe(githubLoginIsInCodeowners, () => {
  test("allows folks found in the codeowners", () => {
    const ortaIn = githubLoginIsInCodeowners("orta", ".");
    expect(ortaIn).toEqual(true);
  });
  test("ignores case", () => {
    const ortaIn = githubLoginIsInCodeowners("OrTa", ".");
    expect(ortaIn).toEqual(true);
  });
  test("denies other accounts", () => {
    const noDogMan = githubLoginIsInCodeowners("dogman", ".");
    expect(noDogMan).toEqual(false);
  });
  test("denies subsets of existing accounts", () => {
    const noOrt = githubLoginIsInCodeowners("ort", ".");
    expect(noOrt).toEqual(false);
  });
})  

describe(hasValidLgtmSubstring, () => {
  test("allows lgtm", () => {
    const isValidSubstring = hasValidLgtmSubstring("this lgtm!");
    expect(isValidSubstring).toEqual(true);
  });
  test("denies lgtm but", () => {
    const isValidSubstring = hasValidLgtmSubstring("this lgtm but");
    expect(isValidSubstring).toEqual(false);
  });
  test("denies lgtm but", () => {
    const isValidSubstring = hasValidLgtmSubstring("this lgtm, but");
    expect(isValidSubstring).toEqual(false);
  });
  test("denies lgtm in double quotes", () => {
    const isValidSubstring = hasValidLgtmSubstring("\"lgtm\"");
    expect(isValidSubstring).toEqual(false);
  });
  test("denies lgtm in single quotes", () => {
    const isValidSubstring = hasValidLgtmSubstring("'lgtm");
    expect(isValidSubstring).toEqual(false);
  });
  test("denies lgtm in inline code blocks", () => {
    const isValidSubstring = hasValidLgtmSubstring("lgtm`");
    expect(isValidSubstring).toEqual(false);
  });
})
