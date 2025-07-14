const KNOWLEDGE_GRAPH_PROMPT = `
**Instruction:**
Extract a detailed knowledge graph from the given text by identifying entities, their relationships, and their attributes. 
Represent these facts as triples and include both explicit and reasonably inferred information.

**Output Requirements:**
- **Entities:** Identify key concepts (people, places, things, events, etc.).
- **Relationships:** Show how entities connect or interact.
- **Attributes:** Provide entity attributes or properties as triples (e.g., "("Entity", "attribute_name", "value")").
- **Graph Representation:** List all extracted facts as triples in the format: "(Subject, Predicate, Object)".

**Guidelines:**
1. Use clear, descriptive language for relationships and attributes.
2. Only include facts that are explicitly stated or that can be reasonably inferred from the text.
3. Avoid redundancy; do not repeat the same fact.
4. For vague or uncertain relationships, use ""associated with"".
5. Infer "is_a" or classification relationships when context allows. For example, if a name is mentioned as a known historical figure, you can infer (
  "Name",
  "is_a",
  "Person"
).
6. Attributes can describe properties like profession, achievements, or characteristics of an entity.

**Example Input:**
"Marie Curie discovered radium and polonium and won two Nobel Prizes for her work in chemistry and physics."

**Example Output:**
- **Triples:**
  - ("Marie Curie", "discovered", "Radium")
  - ("Marie Curie", "discovered", "Polonium")
  - ("Marie Curie", "won", "Nobel Prize")
  - ("Nobel Prize", "associated with", "Chemistry")
  - ("Nobel Prize", "associated with", "Physics")
  - ("Marie Curie", "profession", "Scientist")
  - ("Marie Curie", "achievements", "Two Nobel Prizes")
  - ("Radium", "discovered by", "Marie Curie")
  - ("Polonium", "discovered by", "Marie Curie")
  - ("Marie Curie", "is_a", "Person")
  - ("Marie Curie", "is_a", "Scientist")

**Extract the knowledge graph from the text:**
`;

const EVALUATION_PROMPT = `
**Pre-Prompt:**

Evaluate the provided text’s suitability for LLM-based extraction. Your response must be in **markdown** with three sections: **Missing mandatory fields**, **Improvement Opportunities** and **Description improvements**.

**Missing mandatory fields**  
- List only critical missing fields.  
- If reporting on a missing field, provide the path with *italics*.
- If none, state “No issues.”  
- Do not treat inferable information as missing.

**Improvement Opportunities**  
- Suggest specific additions or changes to enhance schema alignment.  
- If none, state “No improvements needed.”
- When suggesting a field, include the description found in the schema.

**Description improvements**
- Provide general suggestions for improving the description of the schema.
- Focus on how a description can be improved to be more accurate and useful.
- Optimize it for LLM-based extraction.
- Take care that the description is not too implicit, but allow for some expected domain knowledge.
- List the JSON path and the new description as well as an explanation of why it is better.

**Schema Improvements**
- Provide general suggestions for adapting the schema based on the knowledge graph.
- Ensure suggestions are broad and not specific to the given text.
- Align your suggestions with the overall concept of the schema. Avoid suggesting fields that are not closely related.
- You can also suggest changes to the schema.

**Guidelines**  
- The LLM can infer data; do not be overly strict.  
- If something is stated as not existing, its not an issue.  
- This is a quality assessment, not strict validation.  
- Use *italics* for schema fields and paths.  
- Dont comment on detail level; if a field exists, its fine.  
- No need to restate data that matches the schema.
- If you are mentioneing a missing field, include the description of the field.

For missing fields, provide the field name and its description. Example:

- *field_name*: <Field description>

Extremely important:
- If the text does not fit add exactly <UNFIT> to the end of the report.
- If the text fits add exactly <FIT> to the end of the report.
- Schema suggestions do not count as UNFIT.

Your final report should be *insightful*, *detailed* and cover both sections effectively. Return the report in markdown format, but do not use backticks or such.
`;

const EXTRACT_PROMPT = `
You are an expert at analyzing knowledge graphs and extracting structured data. Your task is to:

1. Parse the provided knowledge graph triplets
2. Map the relationships and attributes to the target schema
3. Transform the data into the exact schema format
4. Validate the output matches all schema requirements

Be systematic and thorough in your extraction. Ensure all relevant information from the knowledge graph is captured while maintaining strict schema compliance.
`;

const generateExtractPrompt = (schema: string, instructions: string) => `
You are tasked to extract the data from the given text, PDF or image. If something is not supplied directly, leave it empty. Work precisely and do not hallucinate. Below you will also find a schema, it is essential that you provide the data in the exact schema format as JSON.

The following are instructions that have to be followed strictly: 

${instructions}

This is the JSON schema you have to align it to:
${schema}
`;

const generateExtractPromptChecked = (data: string) => `
You are given an unchecked JSON dataset which you have to extract into a checked JSON dataset. Work precisely and map the data to the schema.

The following is the data to be checked:

${data}
`;

export { KNOWLEDGE_GRAPH_PROMPT, EVALUATION_PROMPT, EXTRACT_PROMPT, generateExtractPrompt, generateExtractPromptChecked };
