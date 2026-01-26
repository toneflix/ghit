import { useOctokit } from 'src/hooks'

/**
 * Delete an issue from a repository.
 * 
 * Github API does not support deleting issues via REST API.
 * As a workaround, we will use the GraphQL API to delete the issue
 * 
 * @param owner 
 * @param repo 
 * @param issue_number 
 */
export const deleteIssue = async (owner: string, repo: string, issue_number: number, node_id?: string) => {
    const octokit = useOctokit()
    let issueId = node_id

    if (!issueId) {
        // First, we need to get the issue ID using GraphQL if it is not provided
        ({ repository: { issue: { id: issueId } } } = await octokit.graphql<{
            repository: {
                issue: {
                    id: string
                }
            }
        }>(`
            query ($owner: String!, $repo: String!, $issue_number: Int!) {
                repository(owner: $owner, name: $repo) {
                    issue(number: $issue_number) {
                        id
                    }
                }
            }
        `, {
            owner,
            repo,
            issue_number,
        }))
    }

    // Now, we can delete the issue using the issue ID
    await octokit.graphql(`
        mutation ($issueId: ID!) {
            deleteIssue(input: {issueId: $issueId}) {
                clientMutationId
            }
        }
    `, {
        issueId,
    })
}   