import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ContratoDetailsLoading() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="h-8 bg-muted rounded w-48 mb-2"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-muted rounded w-24"></div>
          <div className="h-9 bg-muted rounded w-24"></div>
        </div>
      </div>

      {/* Cards de Informação */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48"></div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 bg-muted rounded w-24 mb-2"></div>
              <div className="h-5 bg-muted rounded w-full"></div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-56"></div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 bg-muted rounded w-32 mb-2"></div>
              <div className="h-5 bg-muted rounded w-full"></div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded w-48 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-32"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-6 bg-muted rounded w-32"></div>
                </div>
              </div>
            ))}
            <div className="h-24 bg-muted rounded mt-4"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

