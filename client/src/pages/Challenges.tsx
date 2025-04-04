import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeEditor from "@/components/CodeEditor";
import { ChallengeCategory, Challenge, UserChallengeProgress } from "@shared/schema";
import Header from "@/components/Header";
import { Link } from "wouter";
import { Check, ChevronRight, Play, Home, RefreshCw, RotateCcw, CheckCircle2, XCircle, ArrowLeftCircle } from "lucide-react";

interface TestResult {
  pass: boolean;
  input: any;
  expected: any;
  actual: any;
  error: { name: string; message: string } | null;
}

interface TestResults {
  success: boolean;
  results: TestResult[];
  message: string;
}

export default function ChallengesPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [userCode, setUserCode] = useState("");
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  // Fetch challenge categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<ChallengeCategory[]>({
    queryKey: ['/api/challenge-categories'],
    refetchOnWindowFocus: false
  });

  // Fetch challenges for the selected category
  const { data: challenges = [], isLoading: challengesLoading } = useQuery<Challenge[]>({
    queryKey: ['/api/challenges', selectedCategoryId],
    enabled: selectedCategoryId !== null,
    refetchOnWindowFocus: false
  });

  // Fetch progress data
  const { data: progress = [], isLoading: progressLoading } = useQuery<UserChallengeProgress[]>({
    queryKey: ['/api/challenge-progress'],
    refetchOnWindowFocus: false
  });

  // Load user progress for a challenge
  const getProgressForChallenge = (challengeId: number): UserChallengeProgress | undefined => {
    return progress.find((p) => p.challengeId === challengeId);
  };

  // Set the first category as selected by default
  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories]);

  // Load challenge code when a challenge is selected
  useEffect(() => {
    if (selectedChallenge) {
      // Check if user has existing progress for this challenge
      const existingProgress = getProgressForChallenge(selectedChallenge.id);
      if (existingProgress && existingProgress.userCode) {
        setUserCode(existingProgress.userCode);
      } else {
        setUserCode(selectedChallenge.starterCode);
      }
      // Clear any previous test results
      setTestResults(null);
    }
  }, [selectedChallenge]);

  // Run the challenge code against tests
  const runTests = async () => {
    if (!selectedChallenge) return;
    
    setIsExecuting(true);
    setTestResults(null);
    
    try {
      const response = await apiRequest("POST", `/api/challenges/${selectedChallenge.id}/validate`, {
        code: userCode
      });
      
      const results = await response.json();
      setTestResults(results);
      
      if (results.success) {
        toast({
          title: "Success!",
          description: "All tests passed. Great job!",
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate your solution. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Reset the challenge code to starter code
  const resetCode = () => {
    if (!selectedChallenge) return;
    if (confirm("Are you sure you want to reset your code? Your changes will be lost.")) {
      setUserCode(selectedChallenge.starterCode);
      setTestResults(null);
    }
  };

  // Format code for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "undefined";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  // Check if a challenge is completed
  const isChallengeCompleted = (challengeId: number): boolean => {
    const challengeProgress = getProgressForChallenge(challengeId);
    return challengeProgress?.completed || false;
  };

  // Render the difficulty badge
  const renderDifficultyBadge = (difficulty: string) => {
    const color = 
      difficulty === "easy" ? "bg-green-500" : 
      difficulty === "medium" ? "bg-yellow-500" : 
      "bg-red-500";
    
    return (
      <Badge className={`${color} text-white`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header 
        onSave={() => {}} 
        onRun={() => {}}
        toggleMobileMenu={() => {}}
        isMobileMenuOpen={false}
        hideActions={true}
      />
      
      <div className="flex-1 container mx-auto py-4 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">JavaScript Challenges</h1>
            <p className="text-muted-foreground">
              Test your JavaScript skills with these coding challenges
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home size={16} />
              Back to Editor
            </Button>
          </Link>
        </div>
        
        {selectedChallenge ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedChallenge(null)}
                  className="gap-2"
                >
                  <ArrowLeftCircle size={16} />
                  Back to Challenges
                </Button>
                {renderDifficultyBadge(selectedChallenge.difficulty)}
              </div>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{selectedChallenge.title}</CardTitle>
                  <CardDescription>{selectedChallenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Hints:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {
                        (() => {
                          try {
                            // Parse hints if available and ensure it's a string before parsing
                            const hintsText = selectedChallenge.hints || "[]";
                            const hints = typeof hintsText === 'string' ? JSON.parse(hintsText) : [];
                            return Array.isArray(hints) ? hints.map((hint: string, i: number) => (
                              <li key={i} className="text-sm text-muted-foreground">{hint}</li>
                            )) : null;
                          } catch (error) {
                            return <li className="text-sm text-muted-foreground">No hints available</li>;
                          }
                        })()
                      }
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={resetCode}
                    className="gap-2"
                  >
                    <RotateCcw size={16} />
                    Reset Code
                  </Button>
                  <Button 
                    onClick={runTests}
                    disabled={isExecuting}
                    className="gap-2"
                  >
                    {isExecuting ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
                    {isExecuting ? "Running Tests..." : "Run Tests"}
                  </Button>
                </CardFooter>
              </Card>
              
              {testResults && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      {testResults.success ? (
                        <CheckCircle2 className="text-green-500" size={20} />
                      ) : (
                        <XCircle className="text-red-500" size={20} />
                      )}
                      Test Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {testResults.results.map((result, i) => (
                        <div 
                          key={i} 
                          className={`border rounded-md p-3 ${
                            result.pass ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900' : 
                                         'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-medium mb-2">
                            {result.pass ? (
                              <Check className="text-green-500" size={16} />
                            ) : (
                              <XCircle className="text-red-500" size={16} />
                            )}
                            Test {i + 1}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="font-medium text-muted-foreground">Input:</div>
                              <div className="font-mono bg-background p-1 rounded border mt-1">
                                {formatValue(result.input)}
                              </div>
                            </div>
                            
                            <div>
                              <div className="font-medium text-muted-foreground">Expected:</div>
                              <div className="font-mono bg-background p-1 rounded border mt-1">
                                {formatValue(result.expected)}
                              </div>
                            </div>
                            
                            {!result.pass && (
                              <div className="col-span-2">
                                <div className="font-medium text-muted-foreground">Actual:</div>
                                <div className="font-mono bg-background p-1 rounded border mt-1">
                                  {result.error ? 
                                    `${result.error.name}: ${result.error.message}` : 
                                    formatValue(result.actual)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="flex flex-col h-full">
              <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">Your Solution</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <div className="h-[600px]">
                    <CodeEditor 
                      code={userCode} 
                      setCode={setUserCode} 
                      onRun={runTests} 
                      onFormat={() => {}} 
                      onClear={() => {}}
                      isExecuting={isExecuting}
                      isSimple={true}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div>
            <Tabs defaultValue={categories[0]?.id.toString()} className="w-full">
              <TabsList className="mb-4">
                {categories.map((category: ChallengeCategory) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id.toString()}
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map((category: ChallengeCategory) => (
                <TabsContent key={category.id} value={category.id.toString()}>
                  <div className="mb-4">
                    <p className="text-muted-foreground">{category.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {challenges
                      .filter((challenge: Challenge) => challenge.categoryId === category.id)
                      .sort((a: Challenge, b: Challenge) => a.order - b.order)
                      .map((challenge: Challenge) => (
                        <Card 
                          key={challenge.id} 
                          className={`${
                            isChallengeCompleted(challenge.id) ? 'border-green-500 dark:border-green-700' : ''
                          } hover:shadow-md cursor-pointer transition-all`}
                          onClick={() => setSelectedChallenge(challenge)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {isChallengeCompleted(challenge.id) && (
                                  <CheckCircle2 className="text-green-500" size={16} />
                                )}
                                {challenge.title}
                              </CardTitle>
                              {renderDifficultyBadge(challenge.difficulty)}
                            </div>
                            <CardDescription className="line-clamp-2">
                              {challenge.description}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="pt-2">
                            <Button 
                              variant="ghost" 
                              className="ml-auto text-sm gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedChallenge(challenge);
                              }}
                            >
                              {isChallengeCompleted(challenge.id) ? "View Solution" : "Start Challenge"}
                              <ChevronRight size={16} />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}