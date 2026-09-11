// Least-recently-used storage prevents long sessions/resizes retaining every text layout.
export class BoundedCache extends Map {
  constructor(limit) {
    super();
    if (!Number.isInteger(limit) || limit < 1) throw new RangeError("Cache limit must be a positive integer");
    this.limit = limit;
  }

  get(key) {
    if (!super.has(key)) return undefined;
    const value = super.get(key);
    super.delete(key);
    super.set(key, value);
    return value;
  }

  set(key, value) {
    super.delete(key);
    super.set(key, value);
    if (this.size > this.limit) super.delete(this.keys().next().value);
    return this;
  }
}
