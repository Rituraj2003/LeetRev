import dotenv from 'dotenv'
import { diff } from 'node:util'

const GITHUB_TOKEN=process.env.GITHUB_TOKEN
const GITHUB_REPO=process.env.GITHUB_REPO
const GITHUB_OWNER=process.env.GITHUB_OWNER

const BASE_URL='https://api.github.com'

const headers={
    'authorization':`Bearer ${GITHUB_TOKEN}`,
    'accept':'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
}

export async function fetchRecentCommits(since?: string){
    const url=since
        ?`${BASE_URL}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?since=${since}`
        :`${BASE_URL}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits`


    const res= await fetch(url,{headers})

    if(!res.ok){
        throw new Error(`Github API error: ${res.status} ${res.statusText}`)
    }
    const commits=await res.json() as any[];

    return commits;
}

export async function fetchCommitFiles(sha: string){
    const url=`${BASE_URL}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits/${sha}`

    const res=await fetch(url,{headers})
    if(!res.ok){
        throw new Error(`not fetched,${res.status} ${res.statusText}`)
    }
    const data =await  res.json() as any;
    // console.log(data)
    return data.files as any[]
}

export function parseCommitMessage(message: string){
    const timematch=message.match(/Time:\s*([\d.]+)\s*ms/)
    const spacematch=message.match(/Space:\s*([\d.]+)\s*MB/)

    return {
        timeMs:timematch?parseFloat(timematch[1]):null,
        spaceMb:spacematch?parseFloat(spacematch[1]):null
    }
}

export function parseFileName(filename:string){
    const parts=filename.split('/')
    const folder=parts[0]
    const file=parts[1]

    if(!folder || !file)  return null

    const ext=file.split('.').pop();
    const language=ext || 'unknown'
    return {slug:folder,language}
}

export async function fetchReadme(slug: string) {
  const url = `${BASE_URL}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${slug}/README.md`

  const res = await fetch(url, { headers })

  if (!res.ok) {
    return null  // README might not exist yet
  }

  const data = await res.json() as any
  // GitHub returns file content as base64 encoded string
  const content = Buffer.from(data.content, 'base64').toString('utf-8')
  return content
}

export function parseReadMe(content:string){
    const titlematch=content.match(/<a href="[^"]*">[\d]+\.\s*(.+?)<\/a>/)
    const title=titlematch?titlematch[1].trim():'Unknown'

    const urlmatch=content.match(/href="(https:\/\/leetcode\.com\/problems\/[^"]+)"/)
    const url=urlmatch?urlmatch[1]:''

    const difficultymatch=content.match(/<h3>(Easy|Medium|Hard)<\/h3>/)
    const difficulty=difficultymatch?difficultymatch[1]:'Unknown'

    const topicmatch=content.match(/topics[^<]*<\/p>\s*<p>([^<]+)<\/p>/i)
    const topics = topicmatch
    ? topicmatch[1].split(',').map(t => t.trim()).filter(Boolean)
    : []

    return {title,difficulty,topics,url}
}

export async function fetchFileContent(filePath:string){
    const url=`${BASE_URL}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`
    const res= await fetch(url,{headers});
    
    if(!res.ok) return null;

    const data = await res.json() as any
    const content=Buffer.from(data.content,'base64').toString('utf-8')
    return content
}
