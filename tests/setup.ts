import { useDbPath } from '../src/db'

const [_, setDbPath] = useDbPath()

setDbPath('./tests/temp-db')