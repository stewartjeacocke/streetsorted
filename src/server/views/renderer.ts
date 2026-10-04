import Handlebars from 'handlebars';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type TemplateSources = Record<string, string>;
type ViewContext = Record<string, unknown>;
type Renderer = (templateName: string, context: ViewContext) => string;

const partialNames = new Set(['layout', 'errors']);
const runtimeTemplateNames = [
  'layout',
  'errors',
  'location',
  'nearby',
  'details',
  'review',
  'outcome',
  'recovery',
] as const;

export function createRenderer(sources: TemplateSources): Renderer {
  const handlebars = Handlebars.create();
  const templates = new Map<string, Handlebars.TemplateDelegate>();

  if (!sources.layout) throw new Error('Missing required Handlebars layout template');
  for (const source of Object.values(sources)) handlebars.precompile(source);

  for (const name of partialNames) {
    const source = sources[name];
    if (source) handlebars.registerPartial(name, source);
  }
  for (const [name, source] of Object.entries(sources))
    if (!partialNames.has(name)) templates.set(name, handlebars.compile(source));

  return (templateName, context) => {
    const template = templates.get(templateName);
    if (!template) throw new Error(`Unknown Handlebars template: ${templateName}`);
    return template(context);
  };
}

function loadRuntimeTemplateSources() {
  const currentDirectory = dirname(fileURLToPath(import.meta.url));
  const templateDirectory = resolve(currentDirectory, 'templates');
  return Object.fromEntries(
    runtimeTemplateNames.map((name) => [
      name,
      readFileSync(resolve(templateDirectory, `${name}.hbs`), 'utf8'),
    ]),
  ) as TemplateSources;
}

const renderRuntimeTemplate = createRenderer(loadRuntimeTemplateSources());

export function renderReportPage(
  templateName: Exclude<(typeof runtimeTemplateNames)[number], 'layout' | 'errors'>,
  context: ViewContext,
) {
  return renderRuntimeTemplate(templateName, context);
}
