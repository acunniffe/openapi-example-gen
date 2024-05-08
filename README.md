This cli lets you override the values in OpenAPI examples with a mustache template

```bash
node index.js openapi-petstore.yaml --template="AMERICA" --url="http://google.com" > output.yaml
```

```yaml
    Pet:
      description: Pet object that needs to be added to the store
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Pet'
          examples:
            firstOne:
              x-example-template:
                "name": "{{{template}}}-123"
                "photoUrls.0": "{{{url}}}"
              value:
                name: "Pogo"
                photoUrls: ["https://silly.com"]
        application/xml:
          schema:
            $ref: '#/components/schemas/Pet'

```

The result will be a YAML string you can pipe into a file

```yaml
...
value:
  name: AMERICA-123
  photoUrls:
    - http://google.com
...
```


## To Run 
```bash
yarn install
npm run build
node ./build/index openapi-petstore.yaml --template="AMERICA" --url="http://google.com" > output.yaml
```