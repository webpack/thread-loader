const schema = {
  type: 'object',
  properties: { name: { type: 'string' } },
  additionalProperties: false,
};

module.exports = function optionsCheckLoader() {
  const options = this.getOptions(schema, (value) => value.trusted === true);

  return `module.exports = ${JSON.stringify(options)};`;
};
