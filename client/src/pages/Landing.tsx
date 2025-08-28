import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Radio, 
  Play, 
  Mic, 
  Bot, 
  Heart, 
  Download,
  Users,
  Globe,
  Zap
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        <div className="relative container mx-auto px-4 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Radio className="text-primary-foreground w-6 h-6" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold">RadioWave</h1>
            </div>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Discover, stream, and record radio stations from around the world with 
              <span className="text-primary font-semibold"> AI-powered search</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => window.location.href = "/api/login"}
                data-testid="get-started-button"
              >
                <Play className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                data-testid="learn-more-button"
              >
                <Radio className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need for radio streaming
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stream live radio, record your favorite shows, and discover new stations 
              with our intelligent AI assistant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Live Streaming */}
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Radio className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Live Streaming</h3>
                <p className="text-muted-foreground">
                  Access thousands of radio stations worldwide with crystal-clear audio quality 
                  and minimal buffering.
                </p>
              </CardContent>
            </Card>

            {/* AI Search */}
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="text-accent w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Search</h3>
                <p className="text-muted-foreground">
                  Find stations using natural language. Just say "Find me jazz stations for work" 
                  and our AI will recommend perfect matches.
                </p>
              </CardContent>
            </Card>

            {/* Recording */}
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="text-destructive w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Recording</h3>
                <p className="text-muted-foreground">
                  Record multiple stations simultaneously and save your favorite shows 
                  for offline listening anytime.
                </p>
              </CardContent>
            </Card>

            {/* Global Access */}
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="text-blue-500 w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Global Stations</h3>
                <p className="text-muted-foreground">
                  Discover radio stations from every corner of the world, spanning all genres 
                  and languages.
                </p>
              </CardContent>
            </Card>

            {/* Favorites */}
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="text-pink-500 w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Personal Library</h3>
                <p className="text-muted-foreground">
                  Save your favorite stations, organize recordings, and build your 
                  personalized radio experience.
                </p>
              </CardContent>
            </Card>

            {/* Offline Downloads */}
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Download className="text-green-500 w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Offline Access</h3>
                <p className="text-muted-foreground">
                  Download recordings for offline listening and never miss your 
                  favorite programs again.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-foreground mb-2">50,000+</div>
              <div className="text-primary-foreground/80">Radio Stations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-foreground mb-2">180+</div>
              <div className="text-primary-foreground/80">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-foreground mb-2">24/7</div>
              <div className="text-primary-foreground/80">Live Streaming</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to revolutionize your radio experience?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of music lovers who have already discovered the future of radio streaming.
          </p>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => window.location.href = "/api/login"}
            data-testid="cta-signup-button"
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Listening Now
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Radio className="text-primary-foreground w-4 h-4" />
              </div>
              <span className="text-lg font-semibold">RadioWave</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2024 RadioWave. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
