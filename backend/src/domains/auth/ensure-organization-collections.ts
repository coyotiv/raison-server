import type { Db } from 'mongodb'
import mongoose from 'mongoose'

type CollectionDefinition = {
  name: string
  validator?: Record<string, unknown>
}

const collections: CollectionDefinition[] = [
  {
    name: 'organization',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['id', 'name', 'slug', 'createdAt'],
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          id: {
            bsonType: 'string',
          },
          name: {
            bsonType: 'string',
          },
          slug: {
            bsonType: 'string',
          },
          logo: {
            bsonType: ['string', 'null'],
          },
          metadata: {
            bsonType: ['object', 'null'],
          },
          createdAt: {
            bsonType: 'date',
          },
          updatedAt: {
            bsonType: ['date', 'null'],
          },
        },
        additionalProperties: true,
      },
    },
  },
  {
    name: 'member',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['id', 'userId', 'organizationId', 'role', 'createdAt'],
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          id: {
            bsonType: 'string',
          },
          userId: {
            bsonType: 'string',
          },
          organizationId: {
            bsonType: 'string',
          },
          role: {
            bsonType: 'string',
          },
          createdAt: {
            bsonType: 'date',
          },
          updatedAt: {
            bsonType: ['date', 'null'],
          },
        },
        additionalProperties: true,
      },
    },
  },
  {
    name: 'invitation',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['id', 'email', 'inviterId', 'organizationId', 'role', 'status', 'expiresAt'],
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          id: {
            bsonType: 'string',
          },
          email: {
            bsonType: 'string',
          },
          inviterId: {
            bsonType: 'string',
          },
          organizationId: {
            bsonType: 'string',
          },
          role: {
            bsonType: ['string', 'array'],
            items: {
              bsonType: 'string',
            },
          },
          status: {
            bsonType: 'string',
          },
          expiresAt: {
            bsonType: 'date',
          },
          createdAt: {
            bsonType: ['date', 'null'],
          },
          updatedAt: {
            bsonType: ['date', 'null'],
          },
          teamId: {
            bsonType: ['string', 'null'],
          },
        },
        additionalProperties: true,
      },
    },
  },
]

export async function ensureOrganizationCollections(db: Db): Promise<void> {
  
  const existingCollections = new Set(
    (await db.listCollections({}, { nameOnly: true }).toArray()).map((collection) => collection.name)
  )

  const creationTasks = collections.map(async ({ name, validator }) => {
    if (!existingCollections.has(name)) {
      await db.createCollection(name, validator ? { validator } : undefined)
      return
    }

    if (validator) {
      await db
        .command({
          collMod: name,
          validator,
          validationLevel: 'moderate',
        })
        .catch(() => undefined)
    }
  })

  await Promise.all(creationTasks)
}
