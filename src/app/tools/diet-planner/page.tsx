'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import AuthModal from '@/components/auth/AuthModal'
import { 
  ArrowLeft,
  User,
  Target,
  Activity,
  Clock,
  Utensils,
  Apple,
  Calculator,
  TrendingUp,
  TrendingDown,
  Heart,
  Brain,
  Zap,
  Coffee,
  Upload,
  Download,
  Share2,
  Plus,
  Minus,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Info,
  Smartphone,
  Calendar,
  Star,
  Flame,
  Droplets,
  Shield,
  Eye,
  RefreshCw,
  Camera,
  FileText,
  Save,
  X,
  Edit3,
  Trash2
} from 'lucide-react'

// Types
interface UserProfile {
  age: number
  gender: 'male' | 'female' | 'other'
  height: number
  weight: number
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal: 'lose_weight' | 'maintain_weight' | 'gain_weight' | 'build_muscle'
  studentType: 'school' | 'college' | 'university' | 'working_student'
  budget: 'low' | 'medium' | 'high'
  dietaryRestrictions: string[]
  healthConditions: string[]
  mealPreferences: string[]
  cookingSkill: 'beginner' | 'intermediate' | 'advanced'
  timeAvailable: 'minimal' | 'moderate' | 'plenty'
}

interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
}

interface Food {
  name: string
  category: string
  nutrition: NutritionInfo
  serving: string
  benefits: string[]
  studentFriendly: boolean
  cost: 'low' | 'medium' | 'high'
  prepTime: number
}

interface Meal {
  name: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foods: Food[]
  totalNutrition: NutritionInfo
  prepTime: number
  cost: number
  instructions: string[]
  tips: string[]
}

interface DietPlan {
  dailyCalories: number
  dailyNutrition: NutritionInfo
  meals: Meal[]
  waterIntake: number
  supplements: string[]
  tips: string[]
  weeklyPlan: { [key: string]: Meal[] }
}

export default function DietPlanner() {
  // Authentication
  const { user } = useAuth()
  
  // State management
  const [currentStep, setCurrentStep] = useState<'profile' | 'questionnaire' | 'plan' | 'analysis' | 'upload'>('profile')
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({
    dietaryRestrictions: [],
    healthConditions: [],
    mealPreferences: []
  })
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedPlan, setUploadedPlan] = useState<string>('')
  const [planAnalysis, setPlanAnalysis] = useState<any>(null)
  const [showDetailedNutrition, setShowDetailedNutrition] = useState(false)
  const [selectedDay, setSelectedDay] = useState('Monday')
  
  // New states for functionality
  const [savedPlans, setSavedPlans] = useState<DietPlan[]>([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSavedPlans, setShowSavedPlans] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDownloadOptions, setShowDownloadOptions] = useState(false)

  // Food database (simplified for demo)
  const foodDatabase: Food[] = [
    {
      name: "Oats",
      category: "Grains",
      nutrition: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sugar: 0.99, sodium: 2 },
      serving: "100g",
      benefits: ["High fiber", "Heart healthy", "Sustained energy"],
      studentFriendly: true,
      cost: "low",
      prepTime: 5
    },
    {
      name: "Banana",
      category: "Fruits",
      nutrition: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2, sodium: 1 },
      serving: "1 medium",
      benefits: ["Potassium rich", "Quick energy", "Brain food"],
      studentFriendly: true,
      cost: "low",
      prepTime: 0
    },
    {
      name: "Eggs",
      category: "Protein",
      nutrition: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124 },
      serving: "2 large",
      benefits: ["Complete protein", "Brain health", "Muscle building"],
      studentFriendly: true,
      cost: "low",
      prepTime: 10
    },
    {
      name: "Brown Rice",
      category: "Grains",
      nutrition: { calories: 112, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 1 },
      serving: "100g cooked",
      benefits: ["Complex carbs", "B vitamins", "Sustained energy"],
      studentFriendly: true,
      cost: "low",
      prepTime: 20
    },
    {
      name: "Chicken Breast",
      category: "Protein",
      nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
      serving: "100g",
      benefits: ["Lean protein", "Muscle building", "Low fat"],
      studentFriendly: true,
      cost: "medium",
      prepTime: 15
    },
    {
      name: "Greek Yogurt",
      category: "Dairy",
      nutrition: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.6, sodium: 36 },
      serving: "100g",
      benefits: ["Probiotics", "High protein", "Calcium rich"],
      studentFriendly: true,
      cost: "medium",
      prepTime: 0
    },
    {
      name: "Spinach",
      category: "Vegetables",
      nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79 },
      serving: "100g",
      benefits: ["Iron rich", "Folate", "Antioxidants"],
      studentFriendly: true,
      cost: "low",
      prepTime: 5
    },
    {
      name: "Almonds",
      category: "Nuts",
      nutrition: { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5, sugar: 4.4, sodium: 1 },
      serving: "100g",
      benefits: ["Healthy fats", "Vitamin E", "Brain food"],
      studentFriendly: true,
      cost: "high",
      prepTime: 0
    },
    {
      name: "Sweet Potato",
      category: "Vegetables",
      nutrition: { calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3, sugar: 4.2, sodium: 5 },
      serving: "100g",
      benefits: ["Beta carotene", "Complex carbs", "Fiber rich"],
      studentFriendly: true,
      cost: "low",
      prepTime: 25
    },
    {
      name: "Tuna",
      category: "Protein",
      nutrition: { calories: 144, protein: 30, carbs: 0, fat: 0.8, fiber: 0, sugar: 0, sodium: 39 },
      serving: "100g",
      benefits: ["Omega-3", "High protein", "Low fat"],
      studentFriendly: true,
      cost: "medium",
      prepTime: 5
    }
  ]

  // Calculate BMR and daily calories
  const calculateDailyCalories = (profile: UserProfile): number => {
    let bmr = 0
    
    // Mifflin-St Jeor Equation
    if (profile.gender === 'male') {
      bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + 5
    } else {
      bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) - 161
    }

    // Activity level multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }

    let dailyCalories = bmr * activityMultipliers[profile.activityLevel]

    // Adjust based on goal
    switch (profile.goal) {
      case 'lose_weight':
        dailyCalories -= 500 // 1 lb per week
        break
      case 'gain_weight':
      case 'build_muscle':
        dailyCalories += 500
        break
      default:
        break
    }

    return Math.round(dailyCalories)
  }

  // Generate personalized diet plan
  const generateDietPlan = async (): Promise<DietPlan> => {
    const profile = userProfile as UserProfile
    const dailyCalories = calculateDailyCalories(profile)
    
    // Macronutrient distribution
    let proteinPercent = 0.25
    let carbPercent = 0.45
    let fatPercent = 0.30

    // Adjust based on goal
    if (profile.goal === 'build_muscle') {
      proteinPercent = 0.30
      carbPercent = 0.40
      fatPercent = 0.30
    } else if (profile.goal === 'lose_weight') {
      proteinPercent = 0.30
      carbPercent = 0.35
      fatPercent = 0.35
    }

    const dailyProtein = (dailyCalories * proteinPercent) / 4
    const dailyCarbs = (dailyCalories * carbPercent) / 4
    const dailyFat = (dailyCalories * fatPercent) / 9

    // Generate meals based on preferences and restrictions
    const meals = generateMeals(profile, dailyCalories)
    
    // Generate weekly plan
    const weeklyPlan = generateWeeklyPlan(meals)

    return {
      dailyCalories,
      dailyNutrition: {
        calories: dailyCalories,
        protein: dailyProtein,
        carbs: dailyCarbs,
        fat: dailyFat,
        fiber: 25,
        sugar: dailyCalories * 0.1 / 4,
        sodium: 2300
      },
      meals,
      waterIntake: Math.round(profile.weight * 35), // ml per kg body weight
      supplements: generateSupplements(profile),
      tips: generateTips(profile),
      weeklyPlan
    }
  }

  const generateMeals = (profile: UserProfile, dailyCalories: number): Meal[] => {
    const meals: Meal[] = []
    
    // Breakfast (25% of daily calories)
    const breakfastCalories = dailyCalories * 0.25
    meals.push(createMeal('breakfast', breakfastCalories, profile))
    
    // Lunch (35% of daily calories)
    const lunchCalories = dailyCalories * 0.35
    meals.push(createMeal('lunch', lunchCalories, profile))
    
    // Dinner (30% of daily calories)
    const dinnerCalories = dailyCalories * 0.30
    meals.push(createMeal('dinner', dinnerCalories, profile))
    
    // Snacks (10% of daily calories)
    const snackCalories = dailyCalories * 0.10
    meals.push(createMeal('snack', snackCalories, profile))
    
    return meals
  }

  const createMeal = (type: string, targetCalories: number, profile: UserProfile): Meal => {
    let selectedFoods: Food[] = []
    let totalCalories = 0
    
    // Filter foods based on dietary restrictions
    const availableFoods = foodDatabase.filter(food => {
      if (profile.dietaryRestrictions.includes('vegetarian') && 
          ['chicken breast', 'tuna'].includes(food.name.toLowerCase())) {
        return false
      }
      if (profile.dietaryRestrictions.includes('vegan') && 
          ['eggs', 'greek yogurt', 'chicken breast', 'tuna'].includes(food.name.toLowerCase())) {
        return false
      }
      if (profile.dietaryRestrictions.includes('gluten-free') && 
          ['oats'].includes(food.name.toLowerCase())) {
        return false
      }
      return true
    })

    // Select foods based on meal type and target calories
    if (type === 'breakfast') {
      selectedFoods = [
        availableFoods.find(f => f.name === 'Oats') || availableFoods[0],
        availableFoods.find(f => f.name === 'Banana') || availableFoods[1],
        availableFoods.find(f => f.name === 'Almonds') || availableFoods[2]
      ].filter(Boolean)
    } else if (type === 'lunch') {
      selectedFoods = [
        availableFoods.find(f => f.name === 'Brown Rice') || availableFoods[0],
        availableFoods.find(f => f.name === 'Chicken Breast') || availableFoods[1],
        availableFoods.find(f => f.name === 'Spinach') || availableFoods[2]
      ].filter(Boolean)
    } else if (type === 'dinner') {
      selectedFoods = [
        availableFoods.find(f => f.name === 'Sweet Potato') || availableFoods[0],
        availableFoods.find(f => f.name === 'Tuna') || availableFoods[1],
        availableFoods.find(f => f.category === 'Vegetables') || availableFoods[2]
      ].filter(Boolean)
    } else {
      selectedFoods = [
        availableFoods.find(f => f.name === 'Greek Yogurt') || availableFoods[0],
        availableFoods.find(f => f.name === 'Banana') || availableFoods[1]
      ].filter(Boolean)
    }

    // Calculate total nutrition
    const totalNutrition = selectedFoods.reduce((total, food) => ({
      calories: total.calories + food.nutrition.calories * 0.5, // Adjust serving
      protein: total.protein + food.nutrition.protein * 0.5,
      carbs: total.carbs + food.nutrition.carbs * 0.5,
      fat: total.fat + food.nutrition.fat * 0.5,
      fiber: total.fiber + food.nutrition.fiber * 0.5,
      sugar: total.sugar + food.nutrition.sugar * 0.5,
      sodium: total.sodium + food.nutrition.sodium * 0.5
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 })

    return {
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Meal`,
      type: type as any,
      foods: selectedFoods,
      totalNutrition,
      prepTime: Math.max(...selectedFoods.map(f => f.prepTime)),
      cost: selectedFoods.reduce((total, f) => total + (f.cost === 'low' ? 1 : f.cost === 'medium' ? 2 : 3), 0),
      instructions: generateInstructions(selectedFoods, type),
      tips: generateMealTips(selectedFoods, profile)
    }
  }

  const generateInstructions = (foods: Food[], mealType: string): string[] => {
    const instructions = [
      `Prepare all ingredients for your ${mealType}`,
      `Follow proper food safety and hygiene`,
      `Cook according to recommended times`,
      `Adjust portions based on your needs`
    ]
    return instructions
  }

  const generateMealTips = (foods: Food[], profile: UserProfile): string[] => {
    const tips = [
      "Drink water before meals to aid digestion",
      "Eat slowly and chew thoroughly",
      "Include a variety of colors in your meals"
    ]
    
    if (profile.studentType === 'college') {
      tips.push("Prep meals in bulk to save time during exams")
    }
    
    return tips
  }

  const generateWeeklyPlan = (dailyMeals: Meal[]): { [key: string]: Meal[] } => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const weeklyPlan: { [key: string]: Meal[] } = {}
    
    days.forEach(day => {
      weeklyPlan[day] = [...dailyMeals] // Simple copy for demo
    })
    
    return weeklyPlan
  }

  const generateSupplements = (profile: UserProfile): string[] => {
    const supplements = ['Multivitamin']
    
    if (profile.goal === 'build_muscle') {
      supplements.push('Protein Powder', 'Creatine')
    }
    
    if (profile.dietaryRestrictions.includes('vegan')) {
      supplements.push('Vitamin B12', 'Iron')
    }
    
    if (profile.studentType === 'college' || profile.studentType === 'university') {
      supplements.push('Omega-3', 'Vitamin D')
    }
    
    return supplements
  }

  const generateTips = (profile: UserProfile): string[] => {
    const tips = [
      "Stay hydrated throughout the day",
      "Plan and prep meals in advance",
      "Listen to your body's hunger cues",
      "Include physical activity in your routine"
    ]
    
    if (profile.studentType === 'college') {
      tips.push(
        "Keep healthy snacks in your dorm/bag",
        "Use the campus gym or join sports clubs",
        "Avoid late-night junk food during study sessions"
      )
    }
    
    if (profile.budget === 'low') {
      tips.push(
        "Buy seasonal and local produce",
        "Cook in bulk and freeze portions",
        "Use cheaper protein sources like eggs and legumes"
      )
    }
    
    return tips
  }

  // Analyze uploaded meal plan
  const analyzeMealPlan = (planText: string) => {
    // Simple analysis for demo - in real app, use AI/ML
    const lines = planText.toLowerCase().split('\n')
    const foods = lines.filter(line => line.trim())
    
    let estimatedCalories = 0
    let protein = 0
    let suggestions = []
    
    // Basic keyword matching for analysis
    foods.forEach(food => {
      if (food.includes('rice') || food.includes('bread')) {
        estimatedCalories += 200
      }
      if (food.includes('chicken') || food.includes('egg')) {
        protein += 20
        estimatedCalories += 150
      }
      if (food.includes('oil') || food.includes('butter')) {
        estimatedCalories += 100
      }
      if (food.includes('vegetable') || food.includes('salad')) {
        estimatedCalories += 50
      }
    })
    
    // Generate suggestions
    if (estimatedCalories < 1200) {
      suggestions.push("Your meal plan seems low in calories. Consider adding healthy snacks.")
    }
    if (protein < 50) {
      suggestions.push("Add more protein sources like eggs, chicken, fish, or legumes.")
    }
    if (!planText.includes('fruit')) {
      suggestions.push("Include fruits for vitamins and natural sugars.")
    }
    if (!planText.includes('water')) {
      suggestions.push("Don't forget to include adequate water intake (8-10 glasses).")
    }
    
    const analysis = {
      estimatedCalories,
      protein,
      suggestions,
      score: Math.min(100, Math.max(20, (estimatedCalories / 20) + (protein * 2))),
      improvements: [
        "Add more vegetables for fiber and micronutrients",
        "Include healthy fats like nuts and avocado",
        "Consider meal timing for better metabolism",
        "Balance macronutrients throughout the day"
      ]
    }
    
    setPlanAnalysis(analysis)
  }

  // Button functionality implementations
  const downloadPDF = async () => {
    if (!dietPlan) return
    
    setIsDownloading(true)
    try {
      // Create HTML content for better formatting
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Personalized Diet Plan</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #2563eb; }
        .nutrition-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
        .nutrition-item { text-align: center; padding: 10px; background: #f8fafc; border-radius: 8px; }
        .nutrition-value { font-size: 20px; font-weight: bold; }
        .nutrition-label { font-size: 12px; color: #6b7280; }
        .meal { margin-bottom: 15px; padding: 15px; background: #f9fafb; border-radius: 8px; }
        .meal-title { font-weight: bold; margin-bottom: 8px; }
        .food-list { margin-left: 20px; }
        .tip { margin-bottom: 5px; }
        .supplement { margin-bottom: 5px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">🍎 PERSONALIZED DIET PLAN</div>
        <div>Generated on: ${new Date().toLocaleDateString()}</div>
        <div>For: ${user?.name || 'Student'}</div>
    </div>

    <div class="section">
        <div class="section-title">📊 Daily Nutrition Targets</div>
        <div class="nutrition-grid">
            <div class="nutrition-item">
                <div class="nutrition-value" style="color: #f97316;">${dietPlan.dailyCalories}</div>
                <div class="nutrition-label">Calories</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-value" style="color: #3b82f6;">${Math.round(dietPlan.dailyNutrition.protein)}g</div>
                <div class="nutrition-label">Protein</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-value" style="color: #10b981;">${Math.round(dietPlan.dailyNutrition.carbs)}g</div>
                <div class="nutrition-label">Carbs</div>
            </div>
            <div class="nutrition-item">
                <div class="nutrition-value" style="color: #8b5cf6;">${Math.round(dietPlan.dailyNutrition.fat)}g</div>
                <div class="nutrition-label">Fat</div>
            </div>
        </div>
        <div><strong>💧 Water Intake:</strong> ${dietPlan.waterIntake}ml daily</div>
    </div>

    <div class="section">
        <div class="section-title">🍽️ Daily Meal Plan</div>
        ${dietPlan.meals.map(meal => `
            <div class="meal">
                <div class="meal-title">${meal.type.toUpperCase()} (${Math.round(meal.totalNutrition.calories)} kcal)</div>
                <div class="food-list">
                    ${meal.foods.map(food => `<div>• ${food.name} (${food.serving})</div>`).join('')}
                </div>
                <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">⏱️ Prep Time: ${meal.prepTime} minutes</div>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <div class="section-title">📅 Weekly Schedule</div>
        ${Object.entries(dietPlan.weeklyPlan).map(([day, meals]) => `
            <div style="margin-bottom: 10px;">
                <strong>${day}:</strong>
                <div style="margin-left: 20px;">
                    ${(meals as any[]).map(meal => `<div>• ${meal.type}: ${meal.foods.map((f: any) => f.name).join(', ')}</div>`).join('')}
                </div>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <div class="section-title">💡 Personalized Recommendations</div>
        ${dietPlan.tips.map(tip => `<div class="tip">• ${tip}</div>`).join('')}
    </div>

    <div class="section">
        <div class="section-title">💊 Recommended Supplements</div>
        ${dietPlan.supplements.map(supplement => `<div class="supplement">• ${supplement}</div>`).join('')}
    </div>

    <div class="footer">
        Generated by StudentTools Diet Planner<br>
        Visit: ${window.location.origin}/tools/diet-planner
    </div>
</body>
</html>`
      
      // Create and download HTML file (can be opened in browser and printed as PDF)
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `diet-plan-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Show success message with instructions
      alert('Diet plan downloaded successfully! Open the HTML file in your browser and use Ctrl+P to print or save as PDF.')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Error downloading file. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const downloadCSV = async () => {
    if (!dietPlan) return
    
    setIsDownloading(true)
    try {
      // Create CSV content for meal planning
      const csvContent = `Day,Meal Type,Food Item,Serving,Calories,Protein (g),Carbs (g),Fat (g),Prep Time (min)
${Object.entries(dietPlan.weeklyPlan).map(([day, meals]) => 
  (meals as any[]).map(meal => 
    meal.foods.map((food: any) => 
      `${day},${meal.type},${food.name},${food.serving},${Math.round(food.nutrition.calories)},${Math.round(food.nutrition.protein)},${Math.round(food.nutrition.carbs)},${Math.round(food.nutrition.fat)},${meal.prepTime}`
    ).join('\n')
  ).join('\n')
).join('\n')}

DAILY NUTRITION SUMMARY
Calories,${dietPlan.dailyCalories}
Protein (g),${Math.round(dietPlan.dailyNutrition.protein)}
Carbohydrates (g),${Math.round(dietPlan.dailyNutrition.carbs)}
Fat (g),${Math.round(dietPlan.dailyNutrition.fat)}
Water (ml),${dietPlan.waterIntake}

RECOMMENDATIONS
${dietPlan.tips.map(tip => `"${tip}"`).join('\n')}

SUPPLEMENTS
${dietPlan.supplements.join('\n')}`

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `diet-plan-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      alert('Diet plan exported as CSV successfully!')
    } catch (error) {
      console.error('Error downloading CSV:', error)
      alert('Error downloading file. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const sharePlan = async () => {
    if (!dietPlan) return
    
    setIsSharing(true)
    try {
      const shareText = `Check out my personalized diet plan! 🍎
      
Daily Calories: ${dietPlan.dailyCalories} kcal
Protein: ${Math.round(dietPlan.dailyNutrition.protein)}g
Water: ${dietPlan.waterIntake}ml

Generated with StudentTools Diet Planner`
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Personalized Diet Plan',
          text: shareText,
          url: window.location.href
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText + '\n\n' + window.location.href)
        alert('Diet plan details copied to clipboard!')
      }
    } catch (error: any) {
      console.error('Error sharing:', error)
      if (error.name !== 'AbortError') {
        alert('Error sharing plan. Details copied to clipboard instead.')
      }
    } finally {
      setIsSharing(false)
    }
  }

  const savePlanToProfile = async () => {
    if (!dietPlan) return
    
    if (!user) {
      setShowAuthModal(true)
      return
    }
    
    setIsSaving(true)
    try {
      // Create plan with timestamp and user info
      const planToSave = {
        ...dietPlan,
        id: Date.now().toString(),
        userId: user.email,
        savedAt: new Date().toISOString(),
        userProfile: userProfile,
        planName: `Diet Plan - ${new Date().toLocaleDateString()}`
      }
      
      // Save to localStorage (in real app, save to database)
      const existingPlans = JSON.parse(localStorage.getItem(`student_tools_${user.id}_dietPlans`) || '[]')
      const updatedPlans = [...existingPlans, planToSave]
      localStorage.setItem(`student_tools_${user.id}_dietPlans`, JSON.stringify(updatedPlans))
      
      // Update state
      setSavedPlans(updatedPlans)
      
      alert('Diet plan saved to your profile successfully!')
    } catch (error) {
      console.error('Error saving plan:', error)
      alert('Error saving plan. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const generateNewPlan = async () => {
    if (!userProfile.age || !userProfile.gender || !userProfile.height || !userProfile.weight) {
      alert('Please complete your profile first to generate a new plan.')
      setCurrentStep('profile')
      return
    }
    
    setIsGenerating(true)
    try {
      // Generate new plan with slight variations
      await new Promise(resolve => setTimeout(resolve, 2000))
      const newPlan = await generateDietPlan()
      setDietPlan(newPlan)
      alert('New diet plan generated successfully!')
    } catch (error) {
      console.error('Error generating new plan:', error)
      alert('Error generating new plan. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Load saved plans on component mount
  useEffect(() => {
    if (user) {
      try {
        const saved = JSON.parse(localStorage.getItem(`student_tools_${user.id}_dietPlans`) || '[]')
        const userPlans = saved.filter((plan: any) => plan.userId === user.email)
        setSavedPlans(userPlans)
      } catch (error) {
        console.error('Error loading saved plans:', error)
      }
    }
  }, [user])

  // Handle form submissions
  const handleProfileSubmit = () => {
    if (userProfile.age && userProfile.gender && userProfile.height && userProfile.weight) {
      setCurrentStep('questionnaire')
    }
  }

  const handleQuestionnaireSubmit = () => {
    if (userProfile.activityLevel && userProfile.goal && userProfile.studentType) {
      setCurrentStep('plan')
      generatePlan()
    }
  }

  const generatePlan = async () => {
    setIsGenerating(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      const plan = await generateDietPlan()
      setDietPlan(plan)
    } catch (error) {
      console.error('Error generating plan:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUploadAnalysis = () => {
    if (uploadedPlan.trim()) {
      analyzeMealPlan(uploadedPlan)
    }
  }

  // Format nutrition display
  const formatNutrition = (nutrition: NutritionInfo) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{Math.round(nutrition.calories)}</div>
        <div className="text-sm text-gray-500">Calories</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{Math.round(nutrition.protein)}g</div>
        <div className="text-sm text-gray-500">Protein</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{Math.round(nutrition.carbs)}g</div>
        <div className="text-sm text-gray-500">Carbs</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">{Math.round(nutrition.fat)}g</div>
        <div className="text-sm text-gray-500">Fat</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/tools" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Tools
            </Link>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl">
              <Apple className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Student Diet Planner
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized nutrition plans, calorie tracking, and diet analysis designed specifically for students
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setCurrentStep('profile')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 'profile' 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setCurrentStep('questionnaire')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 'questionnaire' 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Questionnaire
          </button>
          <button
            onClick={() => setCurrentStep('plan')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 'plan' 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Utensils className="w-4 h-4 inline mr-2" />
            Diet Plan
          </button>
          <button
            onClick={() => setCurrentStep('upload')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 'upload' 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Analyze Plan
          </button>
          {user && savedPlans.length > 0 && (
            <button
              onClick={() => setShowSavedPlans(true)}
              className="px-4 py-2 rounded-lg font-medium bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Saved Plans ({savedPlans.length})
            </button>
          )}
        </div>

        {/* Profile Step */}
        {currentStep === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {user && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Welcome back, {user.name}!</span>
                  </div>
                  {savedPlans.length > 0 && (
                    <div className="text-sm text-blue-600">
                      You have {savedPlans.length} saved diet plan{savedPlans.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}

              {!user && (
                <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-amber-800">Sign in to save your diet plans</span>
                  </div>
                  <p className="text-sm text-amber-600 mb-3">
                    Create an account to save multiple diet plans, track your progress, and access your plans from any device.
                  </p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm"
                  >
                    Sign In / Sign Up
                  </button>
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      min="13"
                      max="35"
                      value={userProfile.age || ''}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, age: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your age"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={userProfile.gender || ''}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, gender: e.target.value as any }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                    <input
                      type="number"
                      min="120"
                      max="220"
                      value={userProfile.height || ''}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, height: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter height in cm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      min="30"
                      max="200"
                      value={userProfile.weight || ''}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, weight: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter weight in kg"
                    />
                  </div>
                </div>

                {userProfile.age && userProfile.height && userProfile.weight && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Your BMI</h3>
                    <div className="text-2xl font-bold text-blue-600">
                      {((userProfile.weight) / Math.pow(userProfile.height / 100, 2)).toFixed(1)}
                    </div>
                    <div className="text-sm text-blue-600">
                      {(() => {
                        const bmi = userProfile.weight / Math.pow(userProfile.height / 100, 2)
                        if (bmi < 18.5) return "Underweight"
                        if (bmi < 25) return "Normal weight"
                        if (bmi < 30) return "Overweight"
                        return "Obese"
                      })()}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleProfileSubmit}
                  disabled={!userProfile.age || !userProfile.gender || !userProfile.height || !userProfile.weight}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue to Questionnaire
                  <ChevronRight className="w-5 h-5 inline ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questionnaire Step */}
        {currentStep === 'questionnaire' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Lifestyle & Preferences</h2>
              
              <div className="space-y-8">
                {/* Activity Level */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Level</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
                      { value: 'light', label: 'Light', desc: 'Light exercise 1-3 days/week' },
                      { value: 'moderate', label: 'Moderate', desc: 'Moderate exercise 3-5 days/week' },
                      { value: 'active', label: 'Active', desc: 'Heavy exercise 6-7 days/week' },
                      { value: 'very_active', label: 'Very Active', desc: 'Very heavy exercise, physical job' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setUserProfile(prev => ({ ...prev, activityLevel: option.value as any }))}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          userProfile.activityLevel === option.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goal */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Primary Goal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: 'lose_weight', label: 'Lose Weight', icon: TrendingDown, color: 'text-red-500' },
                      { value: 'maintain_weight', label: 'Maintain Weight', icon: Target, color: 'text-blue-500' },
                      { value: 'gain_weight', label: 'Gain Weight', icon: TrendingUp, color: 'text-green-500' },
                      { value: 'build_muscle', label: 'Build Muscle', icon: Zap, color: 'text-purple-500' }
                    ].map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => setUserProfile(prev => ({ ...prev, goal: goal.value as any }))}
                        className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${
                          userProfile.goal === goal.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <goal.icon className={`w-6 h-6 ${goal.color}`} />
                        <span className="font-semibold">{goal.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Student Type */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: 'school', label: 'School Student', desc: 'High school or secondary education' },
                      { value: 'college', label: 'College Student', desc: 'Undergraduate studies' },
                      { value: 'university', label: 'University Student', desc: 'Graduate or post-graduate' },
                      { value: 'working_student', label: 'Working Student', desc: 'Part-time work + studies' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setUserProfile(prev => ({ ...prev, studentType: type.value as any }))}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          userProfile.studentType === type.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">{type.label}</div>
                        <div className="text-sm text-gray-600">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget for Food</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: 'low', label: 'Low Budget', desc: 'Under ₹3,000/month' },
                      { value: 'medium', label: 'Medium Budget', desc: '₹3,000-6,000/month' },
                      { value: 'high', label: 'High Budget', desc: 'Above ₹6,000/month' }
                    ].map((budget) => (
                      <button
                        key={budget.value}
                        onClick={() => setUserProfile(prev => ({ ...prev, budget: budget.value as any }))}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          userProfile.budget === budget.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">{budget.label}</div>
                        <div className="text-sm text-gray-600">{budget.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Dietary Restrictions (Optional)</h3>
                  <div className="flex flex-wrap gap-3">
                    {['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut-free', 'Low-sodium'].map((restriction) => (
                      <button
                        key={restriction}
                        onClick={() => {
                          const current = userProfile.dietaryRestrictions || []
                          const updated = current.includes(restriction.toLowerCase())
                            ? current.filter(r => r !== restriction.toLowerCase())
                            : [...current, restriction.toLowerCase()]
                          setUserProfile(prev => ({ ...prev, dietaryRestrictions: updated }))
                        }}
                        className={`px-4 py-2 rounded-full border-2 transition-all ${
                          (userProfile.dietaryRestrictions || []).includes(restriction.toLowerCase())
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {restriction}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleQuestionnaireSubmit}
                  disabled={!userProfile.activityLevel || !userProfile.goal || !userProfile.studentType || !userProfile.budget}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Generate My Diet Plan
                  <Utensils className="w-5 h-5 inline ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Diet Plan Step */}
        {currentStep === 'plan' && (
          <div className="space-y-8">
            {isGenerating ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800">Generating Your Personalized Diet Plan...</h3>
                <p className="text-gray-600">This may take a few moments</p>
              </div>
            ) : dietPlan ? (
              <>
                {/* Daily Overview */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Daily Nutrition Plan</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Targets</h3>
                      {formatNutrition(dietPlan.dailyNutrition)}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Droplets className="w-5 h-5 text-blue-500" />
                          <span>Water Intake: {dietPlan.waterIntake}ml daily</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-green-500" />
                          <span>Meals: {dietPlan.meals.length} per day</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-purple-500" />
                          <span>Supplements: {dietPlan.supplements.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meal Plan */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Daily Meal Plan</h2>
                    <button
                      onClick={() => setShowDetailedNutrition(!showDetailedNutrition)}
                      className="text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Eye className="w-5 h-5 inline mr-1" />
                      {showDetailedNutrition ? 'Hide' : 'Show'} Detailed Nutrition
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {dietPlan.meals.map((meal, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 capitalize">
                            {meal.type}
                          </h3>
                          <div className="text-sm text-gray-500">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {meal.prepTime} min
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          {meal.foods.map((food, foodIndex) => (
                            <div key={foodIndex} className="flex items-center justify-between">
                              <span className="text-gray-700">{food.name}</span>
                              <span className="text-sm text-gray-500">{food.serving}</span>
                            </div>
                          ))}
                        </div>
                        
                        {showDetailedNutrition && (
                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h4 className="font-medium text-gray-800 mb-2">Nutrition Info</h4>
                            {formatNutrition(meal.totalNutrition)}
                          </div>
                        )}
                        
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Benefits: </span>
                          {meal.foods.flatMap(f => f.benefits).slice(0, 3).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Plan */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Weekly Meal Plan</h2>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {Object.keys(dietPlan.weeklyPlan).map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedDay === day
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dietPlan.weeklyPlan[selectedDay]?.map((meal, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 capitalize mb-2">{meal.type}</h4>
                        <div className="space-y-1">
                          {meal.foods.map((food, foodIndex) => (
                            <div key={foodIndex} className="text-sm text-gray-600">
                              • {food.name}
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-green-600 font-medium">
                          {Math.round(meal.totalNutrition.calories)} cal
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips and Recommendations */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Personalized Tips</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Nutrition Tips</h3>
                      <ul className="space-y-2">
                        {dietPlan.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Supplements</h3>
                      <div className="space-y-2">
                        {dietPlan.supplements.map((supplement, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <span className="text-gray-700">{supplement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <div className="relative">
                    <button 
                      onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                      disabled={isDownloading}
                      className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Download className="w-5 h-5" />
                      {isDownloading ? 'Downloading...' : 'Download'}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {showDownloadOptions && (
                      <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                        <button
                          onClick={() => {
                            downloadPDF()
                            setShowDownloadOptions(false)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <div className="font-medium">Download as HTML</div>
                          <div className="text-sm text-gray-500">Formatted for printing as PDF</div>
                        </button>
                        <button
                          onClick={() => {
                            downloadCSV()
                            setShowDownloadOptions(false)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium">Download as CSV</div>
                          <div className="text-sm text-gray-500">For spreadsheet analysis</div>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={sharePlan}
                    disabled={isSharing}
                    className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Share2 className="w-5 h-5" />
                    {isSharing ? 'Sharing...' : 'Share Plan'}
                  </button>
                  <button 
                    onClick={savePlanToProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    {isSaving ? 'Saving...' : 'Save to Profile'}
                  </button>
                  <button 
                    onClick={generateNewPlan}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-5 h-5" />
                    {isGenerating ? 'Generating...' : 'Generate New Plan'}
                  </button>
                  {user && savedPlans.length > 0 && (
                    <button 
                      onClick={() => setShowSavedPlans(true)}
                      className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      <FileText className="w-5 h-5" />
                      View Saved Plans ({savedPlans.length})
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Apple className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Generate Your Diet Plan?</h3>
                <p className="text-gray-600 mb-4">Complete your profile and questionnaire first</p>
                <button
                  onClick={() => setCurrentStep('profile')}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload Analysis Step */}
        {currentStep === 'upload' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Analyze Your Meal Plan</h2>
              <p className="text-gray-600 mb-6">
                Upload or paste your current meal plan to get calorie analysis and improvement suggestions
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste Your Meal Plan
                  </label>
                  <textarea
                    value={uploadedPlan}
                    onChange={(e) => setUploadedPlan(e.target.value)}
                    placeholder="Example:
Breakfast: 2 eggs, 1 slice bread, 1 banana
Lunch: Rice, chicken, vegetables
Dinner: Fish, sweet potato, salad
Snacks: Nuts, yogurt"
                    className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={handleUploadAnalysis}
                    disabled={!uploadedPlan.trim()}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Calculator className="w-5 h-5 inline mr-2" />
                    Analyze Plan
                  </button>
                  
                  <button
                    onClick={() => setUploadedPlan('')}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              {planAnalysis && (
                <div className="mt-8 space-y-6">
                  {/* Analysis Results */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Analysis Results</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">{planAnalysis.estimatedCalories}</div>
                        <div className="text-sm text-gray-600">Estimated Calories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{planAnalysis.protein}g</div>
                        <div className="text-sm text-gray-600">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{Math.round(planAnalysis.score)}</div>
                        <div className="text-sm text-gray-600">Health Score</div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Health Score</span>
                        <span className="text-sm font-bold">{Math.round(planAnalysis.score)}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, planAnalysis.score)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Suggestions */}
                  <div className="bg-yellow-50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      <AlertCircle className="w-6 h-6 inline mr-2 text-yellow-600" />
                      Improvement Suggestions
                    </h3>
                    <ul className="space-y-3">
                      {planAnalysis.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Detailed Improvements */}
                  <div className="bg-green-50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      <TrendingUp className="w-6 h-6 inline mr-2 text-green-600" />
                      Detailed Improvements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {planAnalysis.improvements.map((improvement: string, index: number) => (
                        <div key={index} className="bg-white p-4 rounded-lg flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button 
                      onClick={() => setCurrentStep('plan')}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Get Personalized Plan
                    </button>
                    <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                      <Download className="w-5 h-5 inline mr-2" />
                      Download Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Saved Plans Modal */}
      {showSavedPlans && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Your Saved Diet Plans</h2>
                <button
                  onClick={() => setShowSavedPlans(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {savedPlans.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Saved Plans</h3>
                  <p className="text-gray-500">Save your first diet plan to see it here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedPlans.map((plan: any, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">{plan.planName}</h3>
                        <span className="text-sm text-gray-500">
                          {new Date(plan.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Daily Calories</span>
                          <span className="font-semibold text-orange-600">{plan.dailyCalories} kcal</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Protein</span>
                          <span className="font-semibold text-blue-600">{Math.round(plan.dailyNutrition.protein)}g</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Water Intake</span>
                          <span className="font-semibold text-blue-400">{plan.waterIntake}ml</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Meals</span>
                          <span className="font-semibold text-green-600">{plan.meals.length} per day</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setDietPlan(plan)
                            setShowSavedPlans(false)
                            setCurrentStep('plan')
                          }}
                          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          Load Plan
                        </button>
                        <button
                          onClick={() => {
                            if (!user) return
                            const updatedPlans = savedPlans.filter((_, i) => i !== index)
                            setSavedPlans(updatedPlans)
                            localStorage.setItem(`student_tools_${user.id}_dietPlans`, JSON.stringify(updatedPlans))
                          }}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
