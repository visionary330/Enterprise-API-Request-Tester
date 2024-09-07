'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toaster, toast } from 'react-hot-toast'
import { Send, Save, Download, Upload, Plus, Trash2, AlertCircle, Github, Linkedin, Globe, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

interface Header {
  key: string
  value: string
}

interface SavedRequest {
  id: string
  name: string
  url: string
  method: RequestMethod
  headers: Header[]
  body: string
  authType: string
  bearerToken: string
  username: string
  password: string
}

const methodExplanations: Record<RequestMethod, string> = {
  GET: `GET is used to request data from a specified resource. GET requests should only retrieve data and should have no other effect on the data.`,
  POST: `POST is used to send data to a server to create/update a resource. The data sent to the server is stored in the request body of the HTTP request.`,
  PUT: `PUT is used to send data to a server to create/update a resource. PUT requests are idempotent, meaning multiple identical requests should have the same effect as a single request.`,
  DELETE: `DELETE is used to delete the specified resource. DELETE requests are idempotent.`,
  PATCH: `PATCH is used to apply partial modifications to a resource. It's non-idempotent and used to make partial changes to an existing resource.`,
  HEAD: `HEAD is almost identical to GET, but without the response body. It's useful for checking what a GET request will return before actually making a GET request.`,
  OPTIONS: `OPTIONS is used to describe the communication options for the target resource. It can be used to determine the capabilities of a web server.`
}

const sampleRequests: Record<RequestMethod, { url: string, headers: Header[], body: string }> = {
  GET: {
    url: 'https://api.example.com/users',
    headers: [{ key: 'Accept', value: 'application/json' }],
    body: ''
  },
  POST: {
    url: 'https://api.example.com/users',
    headers: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Accept', value: 'application/json' }
    ],
    body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }, null, 2)
  },
  PUT: {
    url: 'https://api.example.com/users/1',
    headers: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Accept', value: 'application/json' }
    ],
    body: JSON.stringify({ name: 'John Doe Updated', email: 'john_updated@example.com' }, null, 2)
  },
  DELETE: {
    url: 'https://api.example.com/users/1',
    headers: [{ key: 'Accept', value: 'application/json' }],
    body: ''
  },
  PATCH: {
    url: 'https://api.example.com/users/1',
    headers: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Accept', value: 'application/json' }
    ],
    body: JSON.stringify({ email: 'john_new@example.com' }, null, 2)
  },
  HEAD: {
    url: 'https://api.example.com/users',
    headers: [],
    body: ''
  },
  OPTIONS: {
    url: 'https://api.example.com/users',
    headers: [],
    body: ''
  }
}

export function ApiRequestTester() {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState<RequestMethod>('GET')
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }])
  const [body, setBody] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('headers')
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([])
  const [currentRequestName, setCurrentRequestName] = useState('')
  const [showRawResponse, setShowRawResponse] = useState(true)
  const [authType, setAuthType] = useState('none')
  const [bearerToken, setBearerToken] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  useEffect(() => {
    const savedRequestsFromStorage = localStorage.getItem('savedRequests')
    if (savedRequestsFromStorage) {
      setSavedRequests(JSON.parse(savedRequestsFromStorage))
    }
  }, [])

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index)
    setHeaders(newHeaders)
  }

  const validateInput = () => {
    if (!url.trim()) {
      setError('URL is required')
      return false
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URL must start with http:// or https://')
      return false
    }
    if (authType === 'bearer' && !bearerToken.trim()) {
      setError('Bearer token is required when using Bearer authentication')
      return false
    }
    if (authType === 'basic' && (!username.trim() || !password.trim())) {
      setError('Username and password are required when using Basic authentication')
      return false
    }
    return true
  }

  const sendRequest = async () => {
    setError('')
    setResponse('')

    if (!validateInput()) {
      return
    }

    setIsLoading(true)

    try {
      const headerObject = headers.reduce((acc, header) => {
        if (header.key && header.value) {
          acc[header.key] = header.value
        }
        return acc
      }, {} as Record<string, string>)

      if (authType === 'bearer') {
        headerObject['Authorization'] = `Bearer ${bearerToken}`
      } else if (authType === 'basic') {
        headerObject['Authorization'] = `Basic ${btoa(`${username}:${password}`)}`
      }

      const response = await fetch(url, {
        method,
        headers: headerObject,
        body: ['GET', 'HEAD'].includes(method) ? null : body,
      })

      const responseText = await response.text()
      setResponse(responseText)
      setShowRawResponse(true)
      
      toast.success('Request sent successfully! 🚀')
    } catch (err) {
      setError(err.message)
      toast.error('Failed to send request 😕')
    } finally {
      setIsLoading(false)
    }
  }

  const saveRequest = () => {
    if (!currentRequestName.trim()) {
      toast.error('Please enter a name for the request 📝')
      return
    }

    const newSavedRequest: SavedRequest = {
      id: Date.now().toString(),
      name: currentRequestName,
      url,
      method,
      headers,
      body,
      authType,
      bearerToken,
      username,
      password
    }

    const updatedSavedRequests = [...savedRequests, newSavedRequest]
    setSavedRequests(updatedSavedRequests)
    localStorage.setItem('savedRequests', JSON.stringify(updatedSavedRequests))
    setCurrentRequestName('')
    toast.success('Request saved successfully! 💾')
  }

  const loadRequest = (request: SavedRequest) => {
    setUrl(request.url)
    setMethod(request.method)
    setHeaders(request.headers)
    setBody(request.body)
    setAuthType(request.authType)
    setBearerToken(request.bearerToken)
    setUsername(request.username)
    setPassword(request.password)
    toast.success('Request loaded successfully! 📂')
  }

  const deleteRequest = (id: string) => {
    const updatedSavedRequests = savedRequests.filter(request => request.id !== id)
    setSavedRequests(updatedSavedRequests)
    localStorage.setItem('savedRequests', JSON.stringify(updatedSavedRequests))
    toast.success('Request deleted successfully! 🗑️')
  }

  const exportRequests = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedRequests))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "api_requests.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
    toast.success('Requests exported successfully! 📤')
  }

  const importRequests = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content === 'string') {
          try {
            const importedRequests = JSON.parse(content)
            setSavedRequests(importedRequests)
            localStorage.setItem('savedRequests', JSON.stringify(importedRequests))
            toast.success('Requests imported successfully! 📥')
          } catch (err) {
            toast.error('Failed to import requests. Invalid file format. 😕')
          }
        }
      }
      reader.readAsText(file)
    }
  }

  const loadSampleRequest = () => {
    const sample = sampleRequests[method]
    setUrl(sample.url)
    setHeaders(sample.headers)
    setBody(sample.body)
    toast.success('Sample request loaded! 🧪')
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-100 to-green-100">
      <Toaster position="top-right" />
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg p-6 max-w-md"
          >
            <h2 className="text-xl font-bold mb-2">Disclaimer ⚠️</h2>
            <p className="mb-4">This tool is for educational purposes only. Be cautious when testing APIs, especially those you don't own or have permission to access.</p>
            <Button onClick={() => setShowDisclaimer(false)} className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300">
              I Understand
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto max-w-4xl bg-white rounded-lg shadow-2xl p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-black">
            Enterprise API Request Tester 🚀
          </h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => toast.info('This tool allows you to test API endpoints with various HTTP methods and parameters. 🛠️')}
            className="hover:bg-blue-100 transition-colors duration-300"
          >
            <Info className="h-6 w-6" />
          </Button>
        </div>
        <div className="space-y-6">
          <div className="flex gap-2">
            <Select value={method} onValueChange={(value) => setMethod(value as RequestMethod)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="HEAD">HEAD</SelectItem>
                <SelectItem value="OPTIONS">OPTIONS</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-grow transition-all duration-300 focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={loadSampleRequest} variant="outline" className="hover:bg-blue-100 transition-colors duration-300">
              Load Sample
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-3 bg-blue-100 rounded-lg p-1">
              <TabsTrigger value="headers" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">Headers</TabsTrigger>
              <TabsTrigger value="body" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">Body</TabsTrigger>
              <TabsTrigger value="auth" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">Auth</TabsTrigger>
            </TabsList>
            <TabsContent value="headers" className="space-y-2 mt-4">
              {headers.map((header, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Header Key"
                    value={header.key}
                    onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <Input
                    placeholder="Header Value"
                    value={header.value}
                    onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <Button variant="outline" onClick={() => removeHeader(index)} className="hover:bg-red-100 transition-colors duration-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
              <Button onClick={addHeader} variant="outline" className="w-full mt-2 hover:bg-blue-100 transition-colors duration-300">
                <Plus className="h-4 w-4 mr-2" />
                Add Header
              </Button>
            </TabsContent>
            <TabsContent value="body" className="mt-4">
              <Textarea
                placeholder="Request Body (JSON)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[200px] w-full transition-all duration-300 focus:ring-2 focus:ring-blue-500"
              />
            </TabsContent>
            <TabsContent value="auth" className="space-y-4 mt-4">
              <Select value={authType} onValueChange={setAuthType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Auth Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                </SelectContent>
              </Select>
              {authType === 'bearer' && (
                <Input
                  type="text"
                  placeholder="Enter Bearer Token"
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                  className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                />
              )}
              {authType === 'basic' && (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
          <div className="flex gap-2">
            <Button
              onClick={sendRequest}
              disabled={isLoading}
              className="flex-grow bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? 'Sending...' : 'Send Request'}
              <Send className="ml-2 h-4 w-4" />
            </Button>
            <Input
              type="text"
              placeholder="Request Name"
              value={currentRequestName}
              onChange={(e) => setCurrentRequestName(e.target.value)}
              className="flex-grow transition-all duration-300 focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={saveRequest}
              disabled={!currentRequestName.trim()}
              className="bg-green-500 text-white hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Card className="mt-6 overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-green-100">
                    <CardTitle className="flex justify-between items-center">
                      Response
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="raw-response"
                          checked={showRawResponse}
                          onCheckedChange={setShowRawResponse}
                        />
                        <Label htmlFor="raw-response">Show Raw</Label>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800">
                        {response}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Accordion type="single" collapsible className="mt-8">
          <AccordionItem value="saved-requests">
            <AccordionTrigger className="text-lg font-semibold text-blue-700 hover:text-blue-900 transition-colors duration-300">Saved Requests 📁</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {savedRequests.map((request) => (
                  <div key={request.id} className="flex items-center gap-2">
                    <Button
                      onClick={() => loadRequest(request)}
                      variant="outline"
                      className="hover:bg-blue-100 transition-colors duration-300"
                    >
                      {request.name}
                    </Button>
                    <Button
                      onClick={() => deleteRequest(request.id)}
                      variant="outline"
                      className="hover:bg-red-100 transition-colors duration-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={exportRequests} variant="outline" className="hover:bg-blue-100 transition-colors duration-300">
                  <Download className="h-4 w-4 mr-2" />
                  Export Requests
                </Button>
                <Button onClick={() => document.getElementById('file-input')?.click()} variant="outline" className="hover:bg-blue-100 transition-colors duration-300">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Requests
                </Button>
                <input
                  id="file-input"
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={importRequests}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="http-methods">
            <AccordionTrigger className="text-lg font-semibold text-blue-700 hover:text-blue-900 transition-colors duration-300">HTTP Methods Explained 📚</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {Object.entries(methodExplanations).map(([method, explanation]) => (
                  <div key={method} className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                    <h4 className="text-md font-semibold mb-2 text-blue-700">{method}</h4>
                    <p className="text-sm text-gray-700">{explanation}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq">
            <AccordionTrigger className="text-lg font-semibold text-blue-700 hover:text-blue-900 transition-colors duration-300">Frequently Asked Questions ❓</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-blue-700">How do I send a POST request with JSON data?</h3>
                  <p className="text-gray-700">Select POST as the method, add a header with key "Content-Type" and value "application/json", then enter your JSON data in the Body tab.</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-blue-700">Can I test authenticated APIs?</h3>
                  <p className="text-gray-700">Yes, you can use the Auth tab to add Bearer token or Basic authentication to your requests.</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-blue-700">How do I save a request for later use?</h3>
                  <p className="text-gray-700">Enter a name for your request in the input field next to the "Save" button, then click "Save". You can access saved requests in the "Saved Requests" section.</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-blue-700">Why am I seeing HTML in the response?</h3>
                  <p className="text-gray-700">If you're seeing HTML in the response, it's likely that the API you're trying to access is returning a web page instead of raw data. This could be due to CORS restrictions or the API not being set up to handle requests from a browser directly. For testing purposes, you might need to use a server-side proxy or a CORS-enabled API.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="technical-stack">
            <AccordionTrigger className="text-lg font-semibold text-blue-700 hover:text-blue-900 transition-colors duration-300">Technical Stack & Implementation Details 🛠️</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-blue-700">Frontend Framework</h3>
                  <p className="text-gray-700">This application is built using React and Next.js, leveraging the power of server-side rendering and static site generation for optimal performance.</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-blue-700">UI Components</h3>
                  <p className="text-gray-700">We use the shadcn/ui library, which provides a set of accessible and customizable React components. These components are styled using Tailwind CSS for rapid and responsive design implementation.</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-blue-700">State Management</h3>
                  <p className="text-gray-700">React's useState and useEffect hooks are used for local state management and side effects. This approach keeps the application simple and avoids the need for complex state management libraries.</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-blue-700">API Requests</h3>
                  <p className="text-gray-700">The Fetch API is used to make HTTP requests. This native browser API provides a powerful and flexible way to send requests and handle responses.</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-blue-700">Data Persistence</h3>
                  <p className="text-gray-700">LocalStorage is used to persist saved requests. This allows users to maintain their saved requests across browser sessions without the need for a backend database.</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-blue-700">Animations</h3>
                  <p className="text-gray-700">Framer Motion is integrated for smooth, physics-based animations. This enhances the user experience by providing visual feedback for actions and state changes.</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-m">
                  <h3 className="font-semibold text-blue-700">Notifications</h3>
                  <p className="text-gray-700">React Hot Toast is used for displaying toast notifications. This provides a non-intrusive way to give feedback to users about the success or failure of their actions.</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-blue-700">Icons</h3>
                  <p className="text-gray-700">Lucide React is used for icons, providing a consistent and scalable icon set throughout the application.</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-blue-700">Handling Multiple Users</h3>
                  <p className="text-gray-700">While this application doesn't have a traditional backend, it supports multiple users by storing data in the browser's localStorage. Each user's saved requests are isolated to their own browser, ensuring privacy and separation of data.</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-blue-700">"Backend of the Frontend"</h3>
                  <p className="text-gray-700">The application leverages Next.js API routes to create a "backend for the frontend". This allows for server-side operations like request proxying or data processing without needing a separate backend server. However, in this specific implementation, all operations are client-side for simplicity and educational purposes.</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-blue-700">TypeScript</h3>
                  <p className="text-gray-700">The entire application is written in TypeScript, providing strong typing and enhancing code quality and maintainability.</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-md">
                  <h3 className="font-semibold text-blue-700">Deployment</h3>
                  <p className="text-gray-700">The application is designed to be easily deployable on Vercel, taking advantage of their seamless integration with Next.js projects.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <footer className="mt-8 text-center text-sm text-gray-600">
          <p>© 2024 Sunny Patel - sunnypatel124555@gmail.com</p>
          <p className="mt-2 text-xs">This web project is protected by copyright. You may not copy, modify, or distribute this work without explicit permission from the author.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <a href="https://github.com/sunnypatell" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="bg-white hover:bg-blue-100 transition-colors duration-300">
                <Github className="h-4 w-4" />
              </Button>
            </a>
            <a href="https://www.linkedin.com/in/sunny-patel-30b460204/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="bg-white hover:bg-blue-100 transition-colors duration-300">
                <Linkedin className="h-4 w-4" />
              </Button>
            </a>
            <a href="https://www.sunnypatel.net/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="bg-white hover:bg-blue-100 transition-colors duration-300">
                <Globe className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </footer>
      </motion.div>
    </div>
  )
}