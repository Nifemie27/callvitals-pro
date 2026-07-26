import { hashPassword, verifyPassword } from "@/utils/password";

describe("password hashing", () => {
  it("produces a hash that verifies against the original password", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    await expect(verifyPassword("Sup3rSecret!", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    await expect(verifyPassword("WrongPassword1", hash)).resolves.toBe(false);
  });

  it("never stores the plaintext password in the hash", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    expect(hash).not.toContain("Sup3rSecret!");
  });

  it("produces a different hash each time (random salt)", async () => {
    const [first, second] = await Promise.all([
      hashPassword("Sup3rSecret!"),
      hashPassword("Sup3rSecret!"),
    ]);
    expect(first).not.toEqual(second);
  });
});
