import { TagMap } from '#ast/components';


/* ****************************************************************************************************************** *
 * Tests
 * ****************************************************************************************************************** */

describe(`Tag Map`, () => {
  let tagMap: TagMap;
  const tags = <const>[ [ 'tag1', true ], [ 'tag2', 'string value' ], [ 'emptyTag', void 0 ] ];
  beforeAll(() => {
    tagMap = new TagMap(tags);
  });

  test(`Has proper prototype`, () => expect(tagMap).toBeInstanceOf(Map));

  test(`toObject() works`, () => {
    expect(tagMap.toObject()).toEqual({
      tag1: true,
      tag2: 'string value',
      emptyTag: true
    });
  })
});
