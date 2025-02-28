import type { GraphQLSchema } from 'graphql'
import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'

import type { ApolloConfig, ApolloServerOptionsWithTypeDefs, BaseContext } from '@apollo/server'
import { NextRequest } from 'next/server'

type GraphQLRouteOptions<Context extends BaseContext = BaseContext> = (
    | {
        typeDefs: ApolloServerOptionsWithTypeDefs<Context>['typeDefs']
        resolvers: ApolloServerOptionsWithTypeDefs<Context>['resolvers']
    }
    | { schema: GraphQLSchema }
) &
    Partial<ApolloConfig>


const server = new ApolloServer({
    typeDefs: "",
    resolvers: {}
})
const handler: (req: NextRequest) => void = startServerAndCreateNextHandler(server)

export {
    handler as GET,
    handler as POST
}