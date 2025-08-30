import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Exercise, InsertExercise } from "@shared/schema";

export function useExercises(searchQuery?: string, muscleGroup?: string) {
  return useQuery({
    queryKey: searchQuery || muscleGroup ? 
      ["/api/exercises", { search: searchQuery, muscleGroup }] : 
      ["/api/exercises"],
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: ["/api/exercises", id],
    enabled: !!id,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (exerciseData: InsertExercise & { imageFile?: File; videoFile?: File }) => {
      const formData = new FormData();
      formData.append("name", exerciseData.name);
      formData.append("description", exerciseData.description || "");
      formData.append("instructions", exerciseData.instructions || "");
      formData.append("muscleGroups", JSON.stringify(exerciseData.muscleGroups));
      formData.append("createdBy", exerciseData.createdBy || "");
      formData.append("isCustom", "true");

      if (exerciseData.imageFile) {
        formData.append("image", exerciseData.imageFile);
      }
      if (exerciseData.videoFile) {
        formData.append("video", exerciseData.videoFile);
      }

      const response = await fetch("/api/exercises", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create exercise");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({
        title: "Exercise Created!",
        description: "Your custom exercise has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create exercise. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertExercise> }) => {
      return apiRequest("PATCH", `/api/exercises/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({
        title: "Exercise Updated!",
        description: "Exercise has been updated successfully.",
      });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/exercises/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      toast({
        title: "Exercise Deleted",
        description: "Exercise has been removed successfully.",
      });
    },
  });
}
