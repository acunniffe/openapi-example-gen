#!/usr/bin/env node
import { Command } from 'commander';
import * as yaml from 'js-yaml';
import { OpenAPIV3_1 } from 'openapi-types';
import fs from 'fs-extra';
import path from 'node:path';
import { applyTemplate, collectAllExamples } from './main.js';
import jsonPatch from 'fast-json-patch';

const program = new Command();

const regex = /^--([^=]+)=(.+)$/;

program
  .argument('<openapi>', 'openapi file')
  .allowUnknownOption(true)
  .action((openapi, options) => {
    // Manually parse additional flags
    const args = process.argv.slice(3); // Assuming the first two elements are node and script name

    const valuesOfTemplates: { [key: string]: string } = {};

    const unknownOptions = args
      .filter((arg) => arg.startsWith('--'))
      .map((flag) => {
        const matches = flag.match(regex);

        if (matches) {
          const flagName = matches[1]; // winning_energy
          const flagValue = matches[2]; // HELLO
          valuesOfTemplates[flagName] = flagValue;
        } else {
        }
      });

    const contents = yaml.load(fs.readFileSync(path.resolve(openapi), 'utf8'));

    const spec = contents as OpenAPIV3_1.Document;

    const examples = collectAllExamples(spec);

    const operations = examples
      .map((example) => applyTemplate(example, valuesOfTemplates, spec))
      .flat(1);

    const newSpec = jsonPatch.applyPatch(spec, operations);

    console.log(yaml.dump(newSpec.newDocument));
  });

program.parse(process.argv);
