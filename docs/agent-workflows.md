# AI-Agent Workflow

Use `tree -r` before editing when the task starts from one known file and the surrounding impact is unclear.

## Install The Skill

Install the reusable agent skill from the repository:

```bash
npx skills add skapxd/tree --skill skapxd-tree
```

For Codex as a global skill:

```bash
npx skills add skapxd/tree --skill skapxd-tree -g -a codex -y
```

## When To Use

Use related files mode for:

- adding a feature to a controller, route, page, component, use case, service, or repository
- changing a shared utility, DTO, schema, hook, adapter, client, or parser
- refactoring a Markdown documentation page with local links
- deciding which files an agent should read before patching
- estimating blast radius after a change

Skip it for:

- tiny single-file edits where the caller and dependencies are already obvious
- global searches where the target file is unknown
- runtime-only couplings that are not represented by imports or Markdown links

## Why It Helps

Large repositories contain too many files for direct reading. The useful first cut is the local relationship graph:

- outgoing relationships show implementation context
- incoming relationships show risk surface
- depth shows how far from the target a file is
- nested trees show which dependency depends on which other dependency

This gives an agent a bounded reading order instead of a noisy project-wide search.

## Recommended Agent Sequence

1. Run the relationship tree:

   ```bash
   npx @skapxd/tree <target-file> -r
   ```

2. Read direct outgoing files first. For code, these are direct imports. For Markdown, these are direct local links.
3. Read the most relevant transitive branch only when the direct files delegate behavior.
4. Read incoming files to understand risk. For code, these are importers. For Markdown, these are backlinks.
5. If the graph is too large, narrow it:

   ```bash
   npx @skapxd/tree <target-file> -r --depth 1
   npx @skapxd/tree <target-file> -r --summary
   ```

6. Use ordinary search only after the relationship graph fails to explain the change.

## Interpretation Rules

- A direct import is usually more important than a transitive import.
- A transitive import still matters when it is part of the execution chain.
- An importer is a consumer and belongs to the risk surface.
- A backlink is a documentation consumer and belongs to the documentation risk surface.
- A `(seen)` node means the file already appeared earlier and is not expanded again.
- A `(cycle)` node means the graph loops back to a file already in the current branch.

## Limits

The graph is static. It does not prove runtime behavior. It can miss dynamic dependency injection, configuration-driven wiring, framework routing conventions, generated code, or string-based imports that are not statically resolvable.
