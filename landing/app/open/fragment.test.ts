import { describe, expect, it, test } from "vitest";
import { readFragment } from "./fragment";

const UUID = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";

describe("readFragment", () => {
  it("builds a join target and the paste-able code", () => {
    expect(readFragment(`#join?s=${UUID}&t=tok3n`)).toEqual({
      url: `voltius://join?s=${UUID}&t=tok3n`,
      code: `${UUID}:tok3n`,
    });
  });

  it("accepts a fragment body without the leading hash", () => {
    expect(readFragment(`join?s=${UUID}&t=tok3n`)?.url).toBe(
      `voltius://join?s=${UUID}&t=tok3n`,
    );
  });

  it("accepts an upper-case session id", () => {
    expect(readFragment(`#join?s=${UUID.toUpperCase()}&t=tok3n`)).not.toBeNull();
  });

  it("builds a verified target with no code", () => {
    expect(readFragment(`#verified?u=${UUID}`)).toEqual({
      url: `voltius://verified?u=${UUID}`,
      code: null,
    });
  });

  describe("route whitelist", () => {
    // Every route the app understands must also be listed here before a link to
    // it can work; an unlisted one has to fail closed rather than hop.
    it.each([
      "#plugin/install?id=evil",
      "#snippet/install?id=evil",
      "#notification/1",
      "#pluginInstall?id=evil",
      "#connect?host=evil.example",
      "#JOIN?s=" + UUID + "&t=tok3n",
      "#join/../verified?u=" + UUID,
      "#unknown",
    ])("rejects %s", (hash) => {
      expect(readFragment(hash)).toBeNull();
    });

    it("rejects an empty fragment", () => {
      expect(readFragment("")).toBeNull();
      expect(readFragment("#")).toBeNull();
    });
  });

  describe("parameter validation", () => {
    it.each([
      `#join?s=${UUID}`,
      `#join?t=tok3n`,
      `#join?s=${UUID}&t=`,
      "#join?s=not-a-uuid&t=tok3n",
      `#join?s=${UUID}x&t=tok3n`,
      "#join",
      "#verified",
      "#verified?u=not-a-uuid",
    ])("rejects %s", (hash) => {
      expect(readFragment(hash)).toBeNull();
    });
  });

  describe("hostile input", () => {
    it("re-encodes parameters instead of letting one close the query", () => {
      const target = readFragment(`#join?s=${UUID}&t=a%26u%3D${UUID}`);
      expect(target?.url).toBe(`voltius://join?s=${UUID}&t=a%26u%3D${UUID}`);
    });

    it("cannot inject another scheme or authority through a parameter", () => {
      const target = readFragment(`#join?s=${UUID}&t=%2F%2Fevil.example`);
      expect(target?.url.startsWith(`voltius://join?`)).toBe(true);
      expect(target?.url).not.toContain("//evil.example");
    });

    it("keeps a nested hash inside the token value", () => {
      const target = readFragment(`#join?s=${UUID}&t=tok3n%23x`);
      expect(target?.code).toBe(`${UUID}:tok3n#x`);
    });
  });
});

describe("the navigate routes", () => {
  it("builds a notification target with and without an entry id", () => {
    expect(readFragment("#notification?n=invite%3A42")).toEqual({
      url: "voltius://notification?n=invite%3A42",
      code: null,
    });
    expect(readFragment("#notification")).toEqual({
      url: "voltius://notification",
      code: null,
    });
  });

  it("rejects an entry id past the length the app accepts", () => {
    expect(readFragment(`#notification?n=${"a".repeat(201)}`)).toBeNull();
    expect(readFragment(`#notification?n=${"a".repeat(200)}`)).not.toBeNull();
  });

  it("passes a settings section the app can render", () => {
    expect(readFragment("#settings?section=integrations")).toEqual({
      url: "voltius://settings?section=integrations",
      code: null,
    });
  });

  it.each(["#settings?section=mcp", "#settings?section=__proto__", "#settings"])(
    "rejects %s",
    (hash) => {
      expect(readFragment(hash)).toBeNull();
    },
  );

  it("builds a billing target with no query string", () => {
    expect(readFragment("#billing")).toEqual({ url: "voltius://billing", code: null });
  });
});

test("an invite fragment forwards a well-formed handle and rejects anything else", () => {
  expect(readFragment("#invite?h=%40kevin-p")?.url).toBe("voltius://invite?h=%40kevin-p");
  expect(readFragment("#invite?h=kevin-p")?.url).toBe("voltius://invite?h=kevin-p");
  expect(readFragment("#invite?h=ab")).toBeNull();
  expect(readFragment("#invite?h=-kevin")).toBeNull();
  expect(readFragment("#invite")).toBeNull();
});

test("a plugin-install fragment forwards a valid id and rejects a path-escaping one", () => {
  expect(readFragment("#plugin-install?id=docker&src=voltius")?.url).toBe(
    "voltius://plugin-install?id=docker&src=voltius",
  );
  expect(readFragment("#plugin-install?id=docker")?.url).toBe("voltius://plugin-install?id=docker");
  expect(readFragment("#plugin-install?id=../evil")).toBeNull();
  expect(readFragment("#plugin-install?id=__meta__")).toBeNull();
  expect(readFragment("#plugin-install?id=Docker")).toBeNull();
  expect(readFragment("#plugin-install")).toBeNull();
});

test("a snippet-install fragment forwards a non-empty id and rejects an over-long one", () => {
  expect(readFragment("#snippet-install?id=docker-cleanup")?.url).toBe(
    "voltius://snippet-install?id=docker-cleanup",
  );
  expect(readFragment("#snippet-install?id=")).toBeNull();
  expect(readFragment("#snippet-install?id=" + "a".repeat(101))).toBeNull();
});

test("no new route produces a paste-able code", () => {
  expect(readFragment("#invite?h=kevin-p")?.code).toBeNull();
  expect(readFragment("#plugin-install?id=docker")?.code).toBeNull();
  expect(readFragment("#snippet-install?id=docker-cleanup")?.code).toBeNull();
});
