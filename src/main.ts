import { OpenAPIV3_1 } from 'openapi-types';
import jp from 'jsonpath';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Operation } from 'fast-json-patch';
import Mustache from 'mustache';

type Example = {
  parentPath: string;
  jsonPath: string;
  example: OpenAPIV3_1.ExampleObject;
};

export function collectAllExamples(openapi: OpenAPIV3_1.Document): Example[] {
  const matching = jp.nodes(openapi, "$..examples.*['x-example-template']");

  console.log(`Found ${matching.length} examples with temples`);

  return matching.map((match) => {
    const [, ...other] = match.path as string[];
    const jsonPath = jsonPointerHelpers.compile(other);

    const parentPath = jsonPointerHelpers.pop(jsonPath);

    const example = jsonPointerHelpers.get(
      openapi,
      parentPath,
    ) as OpenAPIV3_1.ExampleObject;

    return { jsonPath, parentPath, example };
  });
}

export function applyTemplate(
  example: Example,
  templateValues: { [key: string]: string },
  openapi: OpenAPIV3_1.Document,
): Operation[] {
  const template = Object.entries(
    example.example['x-example-template']!,
  ) as unknown as [string, string][];

  return template
    .map(([path, templateString]) => {
      const result = jsonPointerHelpers.append(
        example.parentPath,
        'value',
        ...path.split('.'),
      );

      // @ts-ignore
      const templateRendered = Mustache.render(templateString, templateValues);

      const tryGet = jsonPointerHelpers.tryGet(openapi, result);
      if (tryGet.match && typeof tryGet.value !== 'undefined') {
        if (typeof tryGet.value == 'number') {
          const add: Operation = {
            path: result,
            op: 'replace',
            value: Number(templateRendered),
          };
          return [add];
        } else if (typeof tryGet.value === 'boolean') {
          const add: Operation = {
            path: result,
            op: 'replace',
            value: Boolean(templateRendered),
          };
          return [add];
        } else {
          const add: Operation = {
            path: result,
            op: 'replace',
            value: templateRendered,
          };
          return [add];
        }
      } else {
        return [];
      }
    })
    .flat(1);
}
