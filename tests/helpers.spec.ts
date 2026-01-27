import { describe, expect, it } from 'vitest'
import { isJson, logger, parseURL, promiseWrapper, viewIssue, wait } from '../src/helpers'
import { vi } from 'vitest'
import { Logger } from '@h3ravel/shared'

describe('Helpers Test', () => {
    it('parseURL should correctly parse URLs', () => {
        const url1 = parseURL('http://localhost:3000/webhook')
        expect(url1.hostname).toBe('localhost')
        expect(url1.port).toBe('3000')
        expect(url1.pathname).toBe('/webhook')

        const url2 = parseURL('https://example.com')
        expect(url2.hostname).toBe('example.com')
        expect(url2.port).toBe('')
        expect(url2.pathname).toBe('/')

        const url4 = parseURL('no-protocol.com/path')
        expect(url4.hostname).toBe('no-protocol.com')
        expect(url4.port).toBe('')
        expect(url4.pathname).toBe('/path')
    })

    it('wait should delay execution for specified milliseconds', async () => {
        const start = Date.now()
        await wait(100)
        const end = Date.now()
        expect(end - start).toBeGreaterThanOrEqual(99)
    })

    it('isJson should correctly identify JSON objects', () => {
        expect(isJson({})).toBe(true)
        expect(isJson({ key: 'value' })).toBe(true)
        expect(isJson([])).toBe(true)
        expect(isJson([1, 2, 3])).toBe(true)
        expect(isJson('string')).toBe(false)
        expect(isJson(123)).toBe(false)
        expect(isJson(null)).toBe(false)
        expect(isJson(undefined)).toBe(false)
    })

    it('promiseWrapper should handle resolved and rejected promises', async () => {
        const resolvedPromise = Promise.resolve('success')
        const [err1, result1] = await promiseWrapper(resolvedPromise)
        expect(err1).toBeNull()
        expect(result1).toBe('success')

        const rejectedPromise = Promise.reject(new Error('failure'))
        const [err2, result2] = await promiseWrapper(rejectedPromise)
        expect(err2).toBe('failure')
        expect(result2).toBeNull()
    })

    it('should log issue details when viewIssue is called', () => {
        using spy = vi.spyOn(Logger, 'log').mockImplementation(() => { })

        viewIssue({
            title: 'Sample Issue',
            type: 'Feature',
            body: 'This is a sample issue body.',
            number: 42,
            state: 'open',
            labels: [{ name: 'bug' }, { name: 'help wanted' }],
            assignees: [{ login: 'octocat' }],
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
        } as never)

        expect(spy).toHaveBeenCalled()
        expect(spy.mock.calls[0][0]?.[1]).toEqual(['Sample Issue', ['blue']])
        expect(spy.mock.calls[0][0]?.[3]).toEqual(['Feature', ['blue']])
        expect(spy.mock.calls[0][0]?.[5]).toEqual(['42', ['blue']])
        expect(spy.mock.calls[0][0]?.[7]).toEqual(['open', ['blue']])
        expect(spy.mock.calls[0][0]?.[9]).toEqual(['bug, help wanted', ['blue']])
        expect(spy.mock.calls[0][0]?.[11]).toEqual(['octocat', ['blue']])
        // expect(spy.mock.calls[0][0]?.[13]).toEqual(['1/1/2024, 1:00:00 AM', ['blue']])
        // expect(spy.mock.calls[0][0]?.[15]).toEqual(['1/2/2024, 1:00:00 AM', ['blue']])

        spy.mockRestore()
    })

    it('should log messages with specified styles when logger is called', () => {
        const spy = vi.spyOn(Logger, 'log').mockImplementation(() => { })

        logger('Test message', ['red', 'bold'], true)
        expect(spy).toHaveBeenCalledWith('Test message', ['red', 'bold'], true)

        logger('Another test message', ['green'], false)
        expect(spy).toHaveBeenCalledWith('Another test message', ['green'], false)

        spy.mockRestore()
    })
})