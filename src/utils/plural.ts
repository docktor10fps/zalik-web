const rules = new Intl.PluralRules('uk')

// Ukrainian has three forms: 1 вправа, 2 вправи, 5 вправ
export function plural(count: number, [one, few, many]: [string, string, string]) {
  const category = rules.select(count)

  return category === 'one' ? one : category === 'few' ? few : many
}
