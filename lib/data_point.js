const fs = require('fs')
const path = require('path')
const { v1: uuidv1 } = require('uuid')
const dateFns = require('date-fns')

const { INVALID_DATE_ERROR, INVALID_INPUT_ERROR } = require('./errors')

const LOG_DIRECTORY = path.join(__dirname, '../data')

class LinkedListNode {
  constructor({ data = {}, next = null }) {
    this.data = data
    this.data.next = next
  }
}

function createLogDirectory() {
  if (!fs.existsSync(LOG_DIRECTORY)) {
    fs.mkdirSync(LOG_DIRECTORY)
  }
}

function createDayEntry(data = {}) {
  if (!dateFns.isValid(new Date(data.date))) {
    throw new VError({
      name: INVALID_DATE_ERROR
    }, `Date "${data.date}" is invalid`)
  }

  try {
    for (let field of data) {
      if (!['weight', 'calories'].includes(field)) {
        throw new VError({
          name: INVALID_INPUT_ERROR,
          cause: invalidInputError,
          info: data
        }, `Missing "${field}"`)
      }
    }
  } catch (invalidInputError) {
    throw new VError({
      name: INVALID_INPUT_ERROR,
      cause: invalidInputError,
      info: data
    }, 'Input is malformed')
  }

  const startOfDay = dateFns.startOfDay(new Date(data.date))
  const dataPoint = new LinkedListNode({
    data: {
      date: data.date,
      entries: [
        {
          weight: data.weight,
          calories: data.calories
        }
      ]
    }
  })
}

function writeDayEntry(node, date) {
  const filename = dateFns.format(new Date(date || node.data.date), 'YYYYMMdd') + '.json'

  if (!fs.existsSync(path.join(LOG_DIRECTORY, filename))) {
    fs.writeFileSync(filename, JSON.stringify(node.data))

    return null
  }

  const existingDayEntry = require(filename)
  const existingNode = JSON.parse(existingDayEntry)
  existingNode.data.entries.push(node.entries)
  fs.writeFileSync(filename, JSON.stringify(existingNode.data))

  return null
}

