import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { expenses, income, categories, prompt } = await request.json()

    // Prepare budget analysis data
    const totalIncome = income.reduce((sum: number, item: any) => sum + item.amount, 0)
    const totalExpenses = expenses.reduce((sum: number, item: any) => sum + item.amount, 0)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

    // Category analysis
    const categoryAnalysis = categories.map((cat: any) => {
      const categoryExpenses = expenses.filter((exp: any) => exp.category === cat.name)
      const categoryTotal = categoryExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
      const budgetUtilization = cat.budgetAmount > 0 ? (categoryTotal / cat.budgetAmount) * 100 : 0
      
      return {
        name: cat.name,
        spent: categoryTotal,
        budget: cat.budgetAmount,
        utilization: budgetUtilization
      }
    })

    // Check if OpenRouter API key is available and valid
    const apiKey = process.env.OPENROUTER_API_KEY
    const isApiKeyValid = apiKey && apiKey !== 'your_openrouter_api_key_here' && apiKey.length > 10

    if (isApiKeyValid) {
      try {
        // Create comprehensive analysis prompt
        const analysisPrompt = `
You are a financial advisor for students. Analyze this budget data and provide actionable advice:

FINANCIAL OVERVIEW:
- Total Monthly Income: ₹${totalIncome}
- Total Monthly Expenses: ₹${totalExpenses}
- Current Savings Rate: ${savingsRate.toFixed(1)}%
- Remaining Budget: ₹${totalIncome - totalExpenses}

CATEGORY BREAKDOWN:
${categoryAnalysis.map((cat: any) => 
  `- ${cat.name}: Spent ₹${cat.spent} / Budget ₹${cat.budget} (${cat.utilization.toFixed(1)}% used)`
).join('\n')}

RECENT EXPENSES:
${expenses.slice(-10).map((exp: any) => 
  `- ${exp.category}: ₹${exp.amount} (${exp.description || 'No description'})`
).join('\n')}

Please provide:
1. **Budget Health Score** (1-10 with brief explanation)
2. **Top 3 Spending Insights** (where money is going most)
3. **Savings Optimization Tips** (specific to student lifestyle)
4. **Category-Specific Recommendations** (which categories to focus on)
5. **Monthly Savings Goal** (realistic target based on current income)

Focus on practical, student-friendly advice for Indian context. Keep recommendations specific and actionable.

${prompt ? `\nAdditional Question: ${prompt}` : ''}
`

        // Call OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'X-Title': 'Student Budget Advisor'
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful financial advisor specializing in student budgets and Indian financial context. Provide practical, actionable advice in a friendly tone. Always include specific amounts and percentages when relevant.'
              },
              {
                role: 'user',
                content: analysisPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        })

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status}`)
        }

        const data = await response.json()
        const aiResponse = data.choices?.[0]?.message?.content

        if (!aiResponse) {
          throw new Error('No response from AI')
        }

        // Parse and structure the response
        const structuredResponse = {
          analysis: aiResponse,
          insights: {
            healthScore: Math.max(1, Math.min(10, Math.round(savingsRate / 10 + 5))),
            savingsRate: savingsRate,
            topSpendingCategories: categories
              .map((cat: any) => {
                const categoryTotal = expenses
                  .filter((exp: any) => exp.category === cat.name)
                  .reduce((sum: number, exp: any) => sum + exp.amount, 0)
                return { name: cat.name, amount: categoryTotal }
              })
              .sort((a: any, b: any) => b.amount - a.amount)
              .slice(0, 3),
            recommendations: [
              savingsRate < 10 ? 'Focus on increasing your savings rate to at least 10-20% of income' : '',
              totalExpenses > totalIncome ? 'Reduce expenses to avoid overspending' : '',
              'Track daily expenses to identify unnecessary spending patterns'
            ].filter(Boolean)
          },
          suggestions: {
            dailySpendingLimit: totalIncome > 0 ? Math.round((totalIncome * 0.7) / 30) : 0,
            monthlySavingsTarget: Math.round(totalIncome * 0.2),
            emergencyFundTarget: Math.round(totalExpenses * 3)
          }
        }

        return NextResponse.json({
          success: true,
          data: structuredResponse
        })

      } catch (apiError) {
        console.log('OpenRouter API failed, using fallback analysis:', apiError)
        // Fall through to fallback analysis
      }
    }

    // Fallback analysis when API is not available or fails
    const fallbackResponse = {
      analysis: `## Budget Analysis for CampusToolsHub Student

### 📊 **Budget Health Score: ${Math.max(1, Math.min(10, Math.round(savingsRate / 10 + 5)))}/10**

**Financial Overview:**
- Monthly Income: ₹${totalIncome.toLocaleString()}
- Monthly Expenses: ₹${totalExpenses.toLocaleString()}
- Current Savings: ₹${(totalIncome - totalExpenses).toLocaleString()}
- Savings Rate: ${savingsRate.toFixed(1)}%

**Category Breakdown:**
${categoryAnalysis.map((cat: any) =>
  `- **${cat.name}**: ₹${cat.spent} / ₹${cat.budget} (${cat.utilization.toFixed(1)}% used)${cat.utilization > 100 ? ' ⚠️ Over budget!' : cat.utilization > 80 ? ' ⚡ Near limit' : ' ✅ Good'}`
).join('\n')}### 💡 **Key Insights:**

**Top Spending Categories:**
${categories
  .map((cat: any) => {
    const categoryTotal = expenses
      .filter((exp: any) => exp.category === cat.name)
      .reduce((sum: number, exp: any) => sum + exp.amount, 0)
    return { name: cat.name, amount: categoryTotal }
  })
  .sort((a: any, b: any) => b.amount - a.amount)
  .slice(0, 3)
  .map((cat: any, index: number) => `${index + 1}. ${cat.name}: ₹${cat.amount}`)
  .join('\n')}

**Budget Health Assessment:**
${savingsRate >= 20 ? '✅ Excellent savings rate! You\'re building a strong financial foundation.' :
  savingsRate >= 10 ? '👍 Good savings rate. Consider optimizing to reach 20% if possible.' :
  savingsRate >= 0 ? '⚠️ Low savings rate. Focus on reducing expenses or increasing income.' :
  '🚨 Spending more than earning. Immediate action needed to balance your budget.'}

**Key Recommendations:**
1. **Emergency Fund**: Build an emergency fund of ₹${Math.round(totalExpenses * 3)} (3 months of expenses)
2. **Daily Spending Limit**: Aim for ₹${totalIncome > 0 ? Math.round((totalIncome * 0.7) / 30) : 0} per day for discretionary expenses
3. **Savings Target**: Try to save ₹${Math.round(totalIncome * 0.2)} monthly (20% of income)

**Student-Specific Tips:**
- Use student discounts for software, transport, and food
- Consider shared meals or cooking together with friends
- Track small expenses like tea, snacks, and transport
- Look for free entertainment options on campus
- Set up automatic savings to reach your goals

**Next Steps:**
- Review your highest expense categories
- Set realistic monthly budgets for each category
- Track expenses daily for better awareness
- Celebrate small wins when you stay within budget`,
      insights: {
        healthScore: Math.max(1, Math.min(10, Math.round(savingsRate / 10 + 5))),
        savingsRate: savingsRate,
        topSpendingCategories: categories
          .map((cat: any) => {
            const categoryTotal = expenses
              .filter((exp: any) => exp.category === cat.name)
              .reduce((sum: number, exp: any) => sum + exp.amount, 0)
            return { name: cat.name, amount: categoryTotal }
          })
          .sort((a: any, b: any) => b.amount - a.amount)
          .slice(0, 3),
        recommendations: [
          savingsRate < 10 ? 'Focus on increasing your savings rate to at least 10-20% of income' : '',
          totalExpenses > totalIncome ? 'Reduce expenses to avoid overspending' : '',
          'Track daily expenses to identify unnecessary spending patterns'
        ].filter(Boolean)
      },
      suggestions: {
        dailySpendingLimit: totalIncome > 0 ? Math.round((totalIncome * 0.7) / 30) : 0,
        monthlySavingsTarget: Math.round(totalIncome * 0.2),
        emergencyFundTarget: Math.round(totalExpenses * 3)
      }
    }

    return NextResponse.json({
      success: true,
      data: fallbackResponse,
      fallback: true
    })

  } catch (error) {
    console.error('Budget analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze budget', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
