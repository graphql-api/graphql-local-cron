import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { GraphQLCronJob } from '@graphql-api/cron.local'


export class ApolloGraphqlCronJob extends GraphQLCronJob {
    private client: ApolloClient<any>;
    private jobs: Map<string, GraphQLCronJob>;

    constructor(uri: string) {
        super()
        this.client = new ApolloClient({
            uri,
            cache: new InMemoryCache(),
        });
        this.jobs = new Map();

    }
}