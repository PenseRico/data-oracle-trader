import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, CheckCircle, ArrowRight, BookOpen } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  description: string;
  videoUrl: string;
}

interface LessonPlayerProps {
  moduleTitle: string;
  lessons: Lesson[];
  onClose: () => void;
}

export function LessonPlayer({ moduleTitle, lessons, onClose }: LessonPlayerProps) {
  const [currentLesson, setCurrentLesson] = useState(lessons[0]);
  const [completed, setCompleted] = useState<string[]>([]);

  const toggleComplete = (id: string) => {
    setCompleted(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col lg:flex-row animate-in fade-in duration-300">
      {/* Video Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border/10 flex items-center justify-between bg-muted/5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <BookOpen className="h-4 w-4" />
            </Button>
            <div>
              <div className="text-[10px] text-primary uppercase tracking-widest font-bold">{moduleTitle}</div>
              <div className="text-sm font-display font-bold">{currentLesson.title}</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">Sair do Player</Button>
        </div>

        <div className="flex-1 bg-black flex items-center justify-center relative group">
          <div className="aspect-video w-full max-w-4xl bg-muted/10 flex items-center justify-center">
             {/* Placeholder for Video Player */}
             <div className="text-center space-y-4">
               <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 mx-auto shadow-glow group-hover:scale-110 transition-transform">
                 <Play className="h-8 w-8 text-primary fill-primary" />
               </div>
               <p className="text-muted-foreground text-sm font-mono">Stream: {currentLesson.videoUrl}</p>
             </div>
          </div>
        </div>

        <div className="p-6 space-y-4 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold">{currentLesson.title}</h2>
            <Button 
              onClick={() => toggleComplete(currentLesson.id)}
              variant={completed.includes(currentLesson.id) ? "outline" : "default"}
              className="gap-2"
            >
              {completed.includes(currentLesson.id) ? (
                <>Concluído <CheckCircle className="h-4 w-4 text-primary" /></>
              ) : (
                "Marcar como Concluído"
              )}
            </Button>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {currentLesson.description}
          </p>
        </div>
      </div>

      {/* Playlist Sidebar */}
      <div className="w-full lg:w-80 border-l border-border/10 bg-muted/5 flex flex-col">
        <div className="p-4 border-b border-border/10 font-display font-bold text-xs uppercase tracking-widest text-muted-foreground">
          Conteúdo do Módulo
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {lessons.map((lesson, index) => (
              <button
                key={lesson.id}
                onClick={() => setCurrentLesson(lesson)}
                className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-3 group ${
                  currentLesson.id === lesson.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/30"
                }`}
              >
                <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0 border ${
                  completed.includes(lesson.id) ? "bg-primary border-primary" : "border-border/50 group-hover:border-primary/50"
                }`}>
                  {completed.includes(lesson.id) ? (
                    <CheckCircle className="h-3 w-3 text-white" />
                  ) : (
                    <span className="text-[9px] font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className={`text-xs font-semibold ${currentLesson.id === lesson.id ? "text-primary" : ""}`}>
                    {lesson.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{lesson.duration}</div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
