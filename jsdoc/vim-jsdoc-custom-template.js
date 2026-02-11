const formatParam = (param, i) => {
  if (param.alias) {
    if (param.name) {
      return `{[TODO:type]} ${param.name} - [TODO:description]`
    }
    return param.alias
  }

  if (param.name) {
    return `{[TODO:type]} ${param.name} - [TODO:description]`
  }
  return `{[TODO:type]}`
}

const generateClassDoc = (doc) => {
  const d =
    doc.heritageClauses.length === 0
      ? `
/**
 * 
 */`
      : `
/**
 * 
 *
 * @${doc.heritageClauses.map((h) => `${h.type} ${h.value}`).join('\n * @')}
 */`

  return d.trim()
}

module.exports = {
  generateClassDoc,
  generateInterfaceDoc: generateClassDoc,
  generatePropertyDoc: (doc) => {
    return `
/**
 * @type {${doc.returnType}}
 */`.trimLeft()
  },
  generateFunctionDoc: (doc) => {
    const start =
      doc.params.length === 0
        ? `
/**
 * @function ${doc.name.split('.')[1]}
 * @static [TODO:keepordelete]
 *
 * @description
 * ##### [TODO:description]`
        : `
/**
 * @function ${doc.name.split('.')[1]}
 * @static [TODO:keepordelete]
 *
 * @description
 * ##### [TODO:description]
 *
 * @param ${doc.params.map(formatParam).join('\n * @param ')}`

    const delimiter =
      doc.params.length === 0 && doc.returnType !== ''
        ? `
 *`
        : ``

    const end = `
 *
 * @returns {[TODO:type]} [TODO:description]
 */`
      
    return `${start.trimLeft()}${delimiter}${end.trimRight()}`
  },
}
