'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusCircle, FileText, Library, Settings, FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRecentDocuments, useActions } from '@/store/signStore'
import { formatDateTime } from '@/lib/utils'

export default function HomePage() {
  const router = useRouter()
  const recentDocuments = useRecentDocuments()
  const { createDocument } = useActions()

  const handleNewDocument = (signType: 'G1-1' | 'G1-2') => {
    createDocument(signType)
    router.push('/editor')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-sign-green">AU Sign Studio</h1>
              <p className="text-sm text-muted-foreground">Australian Road Sign Design Tool</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/playground">
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Engine Test
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/library">
                  <Library className="h-4 w-4 mr-2" />
                  Templates
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Design Your Road Signs</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Compliant with AS 1742.6 standard, rapidly generate professional directional signs
          </p>

          <div className="flex justify-center gap-4">
            <Card 
              className="w-64 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleNewDocument('G1-1')}
            >
              <CardHeader>
                <CardTitle className="text-center">G1-1 Sign</CardTitle>
                <CardDescription className="text-center">2 Panels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-sign-green/10 rounded-lg p-8 mb-4">
                  <div className="space-y-2">
                    <div className="h-12 bg-sign-green rounded-md" />
                    <div className="h-12 bg-sign-green rounded-md" />
                  </div>
                </div>
                <Button className="w-full" size="lg">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create G1-1
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="w-64 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleNewDocument('G1-2')}
            >
              <CardHeader>
                <CardTitle className="text-center">G1-2 Sign</CardTitle>
                <CardDescription className="text-center">3 Panels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-sign-green/10 rounded-lg p-8 mb-4">
                  <div className="space-y-2">
                    <div className="h-8 bg-sign-green rounded-md" />
                    <div className="h-8 bg-sign-green rounded-md" />
                    <div className="h-8 bg-sign-green rounded-md" />
                  </div>
                </div>
                <Button className="w-full" size="lg">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create G1-2
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Documents */}
        {recentDocuments.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Recent Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{doc.name}</CardTitle>
                        <CardDescription>{doc.signType}</CardDescription>
                      </div>
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                      Updated {formatDateTime(doc.updatedAt)}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Open
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sign-green/10 mb-4">
              <FileText className="h-6 w-6 text-sign-green" />
            </div>
            <h4 className="font-semibold mb-2">Standards Compliant</h4>
            <p className="text-sm text-muted-foreground">
              Strictly adheres to AS 1742.6 Australian road sign standards
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sign-green/10 mb-4">
              <Library className="h-6 w-6 text-sign-green" />
            </div>
            <h4 className="font-semibold mb-2">Rich Templates</h4>
            <p className="text-sm text-muted-foreground">
              Built-in standard templates with customizable parameters
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sign-green/10 mb-4">
              <Settings className="h-6 w-6 text-sign-green" />
            </div>
            <h4 className="font-semibold mb-2">Flexible Control</h4>
            <p className="text-sm text-muted-foreground">
              Real-time preview with precise control over every design parameter
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>AU Sign Studio v2.0 - Compliant with AS 1742.6 Standard</p>
        </div>
      </footer>
    </div>
  )
}

