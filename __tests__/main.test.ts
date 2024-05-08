import { applyTemplate, collectAllExamples } from '../src/main.js';
import * as fs from 'fs-extra';
import { OpenAPIV3_1 } from 'openapi-types';
import * as yaml from 'js-yaml';

it('jsonpath finds valid examples', () => {
  const spec = readYaml('openapi-petstore.yaml');
  const examples = collectAllExamples(spec);

  expect(examples).toMatchSnapshot();
});

it('can create patches from evaluated patches', () => {
  const spec = readYaml('openapi-petstore.yaml');
  const examples = collectAllExamples(spec);

  const values = {
    template: 'Example',
    url: 'https://google.com',
    uuid_1: '2c359099-4c7d-4ab0-8883-6680769b0c0d',
  };

  const patches1 = applyTemplate(examples[0]!, values, spec);
  expect(patches1).toMatchSnapshot();

  const patches2 = applyTemplate(examples[1]!, values, spec);
  expect(patches2).toMatchSnapshot();
});

function readYaml(path: string) {
  const contents = yaml.load(fs.readFileSync(path, 'utf8'));

  return contents as OpenAPIV3_1.Document;
}
