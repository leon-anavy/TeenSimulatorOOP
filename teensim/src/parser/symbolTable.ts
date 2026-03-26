import type { ClassSchema, SymbolTable } from './types';

export function buildSymbolTable(schema: ClassSchema): SymbolTable {
  const privateFields = new Set<string>();
  const publicFields = new Set<string>();
  const publicMethods = new Map<string, import('./types').MethodDef>();
  const privateMethods = new Map<string, import('./types').MethodDef>();
  const fieldTypes = new Map<string, import('./types').JavaType>();

  for (const field of schema.fields) {
    if (field.accessModifier === 'private') privateFields.add(field.name);
    else publicFields.add(field.name);
    fieldTypes.set(field.name, field.javaType);
  }

  for (const method of schema.methods) {
    if (method.accessModifier === 'public') publicMethods.set(method.name, method);
    else privateMethods.set(method.name, method);
  }

  return { privateFields, publicFields, publicMethods, privateMethods, fieldTypes };
}
