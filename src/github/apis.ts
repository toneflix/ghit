import { XAPITree } from 'ghit'

const APIs = {
    issues: [
        {
            api: 'create',
            alias: undefined,
            endpoint: '/repos/{owner}/{repo}/issues',
            description: 'Create an issue',
            params: [
                {
                    parameter: 'title',
                    required: true,
                    type: 'String',
                    description: 'The title of the issue',
                    paramType: 'body',
                    flag: true
                },
                {
                    parameter: 'body',
                    required: false,
                    type: 'String',
                    description: 'The contents of the issue',
                    paramType: 'body',
                    flag: true
                },
                {
                    parameter: 'owner',
                    required: false,
                    type: 'String',
                    description: 'The account owner of the repository',
                    paramType: 'path',
                    arg: true
                },
                {
                    parameter: 'repo',
                    required: false,
                    type: 'String',
                    description: 'The name of the repository',
                    paramType: 'path',
                    arg: true
                },
            ]
        },
        {
            api: 'listForRepo',
            alias: 'list',
            endpoint: '/repos/{owner}/{repo}/issues',
            description: 'List repository issues',
            params: [
                {
                    parameter: 'owner',
                    required: false,
                    type: 'String',
                    description: 'The account owner of the repository',
                    paramType: 'path',
                },
                {
                    parameter: 'repo',
                    required: false,
                    type: 'String',
                    description: 'The name of the repository',
                    paramType: 'path',
                },
                {
                    parameter: 'state',
                    required: false,
                    type: 'String',
                    description: 'Indicates the state of the issues to return. [open, closed]',
                    paramType: 'query'
                }
            ]
        },
        {
            api: 'get',
            alias: 'get',
            endpoint: '/repos/{owner}/{repo}/issues/{issue_number}',
            description: 'Get a single issue',
            params: [
                {
                    parameter: 'issue_number',
                    required: true,
                    type: 'Number',
                    description: 'The number of the issue to get',
                    paramType: 'path',
                },
                {
                    parameter: 'owner',
                    required: false,
                    type: 'String',
                    description: 'The account owner of the repository',
                    paramType: 'path',
                },
                {
                    parameter: 'repo',
                    required: false,
                    type: 'String',
                    description: 'The name of the repository',
                    paramType: 'path',
                }
            ]
        }
    ],
    orgs: [
        {
            api: 'listForAuthenticatedUser',
            alias: 'list',
            endpoint: '/user/orgs',
            description: 'List organizations for the authenticated user',
            params: [
                {
                    parameter: 'page',
                    required: false,
                    type: 'Number',
                    description: 'Page number of the results to fetch',
                    paramType: 'query'
                },
                {
                    parameter: 'per_page',
                    required: false,
                    type: 'Number',
                    description: 'Results per page (max 100)',
                    paramType: 'query'
                }
            ]
        }
    ]
} as const satisfies XAPITree


export default APIs