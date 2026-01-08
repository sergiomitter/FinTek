export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            audit_logs: {
                Row: {
                    action: string | null
                    id: string
                    new_data: Json | null
                    old_data: Json | null
                    table_name: string | null
                    timestamp: string | null
                    user_email: string | null
                }
                Insert: {
                    action?: string | null
                    id?: string
                    new_data?: Json | null
                    old_data?: Json | null
                    table_name?: string | null
                    timestamp?: string | null
                    user_email?: string | null
                }
                Update: {
                    action?: string | null
                    id?: string
                    new_data?: Json | null
                    old_data?: Json | null
                    table_name?: string | null
                    timestamp?: string | null
                    user_email?: string | null
                }
                Relationships: []
            }
            banks: {
                Row: {
                    account_number: string | null
                    account_type: string | null
                    agency: string | null
                    created_at: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    owner_document: string | null
                    owner_name: string | null
                    type: string | null
                }
                Insert: {
                    account_number?: string | null
                    account_type?: string | null
                    agency?: string | null
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    owner_document?: string | null
                    owner_name?: string | null
                    type?: string | null
                }
                Update: {
                    account_number?: string | null
                    account_type?: string | null
                    agency?: string | null
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    owner_document?: string | null
                    owner_name?: string | null
                    type?: string | null
                }
                Relationships: []
            }
            companies: {
                Row: {
                    cnpj: string
                    created_at: string | null
                    email: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    razao_social: string | null
                }
                Insert: {
                    cnpj: string
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    razao_social?: string | null
                }
                Update: {
                    cnpj?: string
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    razao_social?: string | null
                }
                Relationships: []
            }
            company_partners: {
                Row: {
                    company_id: string | null
                    cpf: string
                    created_at: string | null
                    id: string
                    name: string
                    participation_percentage: number | null
                }
                Insert: {
                    company_id?: string | null
                    cpf: string
                    created_at?: string | null
                    id?: string
                    name: string
                    participation_percentage?: number | null
                }
                Update: {
                    company_id?: string | null
                    cpf?: string
                    created_at?: string | null
                    id?: string
                    name?: string
                    participation_percentage?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "company_partners_company_id_fkey"
                        columns: ["company_id"]
                        isOneToOne: false
                        referencedRelation: "companies"
                        referencedColumns: ["id"]
                    },
                ]
            }
            customers: {
                Row: {
                    cnpj_cpf: string
                    created_at: string | null
                    email: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    phone: string | null
                }
                Insert: {
                    cnpj_cpf: string
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    phone?: string | null
                }
                Update: {
                    cnpj_cpf?: string
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    phone?: string | null
                }
                Relationships: []
            }
            investments: {
                Row: {
                    amount: number | null
                    bank_id: string | null
                    company_id: string | null
                    created_at: string | null
                    current_value: number | null
                    description: string
                    id: string
                    is_active: boolean | null
                }
                Insert: {
                    amount?: number | null
                    bank_id?: string | null
                    company_id?: string | null
                    created_at?: string | null
                    current_value?: number | null
                    description: string
                    id?: string
                    is_active?: boolean | null
                }
                Update: {
                    amount?: number | null
                    bank_id?: string | null
                    company_id?: string | null
                    created_at?: string | null
                    current_value?: number | null
                    description?: string
                    id?: string
                    is_active?: boolean | null
                }
                Relationships: [
                    {
                        foreignKeyName: "investments_bank_id_fkey"
                        columns: ["bank_id"]
                        isOneToOne: false
                        referencedRelation: "banks"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "investments_company_id_fkey"
                        columns: ["company_id"]
                        isOneToOne: false
                        referencedRelation: "companies"
                        referencedColumns: ["id"]
                    },
                ]
            }
            payables: {
                Row: {
                    amount: number
                    bank_id: string | null
                    company_id: string | null
                    created_at: string | null
                    description: string
                    due_date: string
                    id: string
                    payment_date: string | null
                    status: string | null
                    supplier_id: string | null
                    user_id: string | null
                }
                Insert: {
                    amount: number
                    bank_id?: string | null
                    company_id?: string | null
                    created_at?: string | null
                    description: string
                    due_date: string
                    id?: string
                    payment_date?: string | null
                    status?: string | null
                    supplier_id?: string | null
                    user_id?: string | null
                }
                Update: {
                    amount?: number
                    bank_id?: string | null
                    company_id?: string | null
                    created_at?: string | null
                    description?: string
                    due_date?: string
                    id?: string
                    payment_date?: string | null
                    status?: string | null
                    supplier_id?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "payables_bank_id_fkey"
                        columns: ["bank_id"]
                        isOneToOne: false
                        referencedRelation: "banks"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "payables_company_id_fkey"
                        columns: ["company_id"]
                        isOneToOne: false
                        referencedRelation: "companies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "payables_supplier_id_fkey"
                        columns: ["supplier_id"]
                        isOneToOne: false
                        referencedRelation: "suppliers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            people: {
                Row: {
                    birth_date: string | null
                    cpf: string
                    created_at: string | null
                    email: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    nickname: string | null
                    phone: string | null
                }
                Insert: {
                    birth_date?: string | null
                    cpf: string
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    nickname?: string | null
                    phone?: string | null
                }
                Update: {
                    birth_date?: string | null
                    cpf?: string
                    created_at?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    nickname?: string | null
                    phone?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    celular: string | null
                    created_at: string | null
                    email: string
                    failed_attempts: number | null
                    funcao: string | null
                    id: string
                    is_blocked: boolean | null
                    is_first_access: boolean | null
                    last_login: string | null
                    nome: string
                    role: string | null
                    updated_at: string | null
                }
                Insert: {
                    celular?: string | null
                    created_at?: string | null
                    email: string
                    failed_attempts?: number | null
                    funcao?: string | null
                    id: string
                    is_blocked?: boolean | null
                    is_first_access?: boolean | null
                    last_login?: string | null
                    nome: string
                    role?: string | null
                    updated_at?: string | null
                }
                Update: {
                    celular?: string | null
                    created_at?: string | null
                    email?: string
                    failed_attempts?: number | null
                    funcao?: string | null
                    id?: string
                    is_blocked?: boolean | null
                    is_first_access?: boolean | null
                    last_login?: string | null
                    nome?: string
                    role?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            receivables: {
                Row: {
                    amount: number
                    company_id: string | null
                    created_at: string | null
                    customer_id: string | null
                    description: string
                    due_date: string
                    id: string
                    receipt_date: string | null
                    status: string | null
                    user_id: string | null
                }
                Insert: {
                    amount: number
                    company_id?: string | null
                    created_at?: string | null
                    customer_id?: string | null
                    description: string
                    due_date: string
                    id?: string
                    receipt_date?: string | null
                    status?: string | null
                    user_id?: string | null
                }
                Update: {
                    amount?: number
                    company_id?: string | null
                    created_at?: string | null
                    customer_id?: string | null
                    description?: string
                    due_date?: string
                    id?: string
                    receipt_date?: string | null
                    status?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "receivables_company_id_fkey"
                        columns: ["company_id"]
                        isOneToOne: false
                        referencedRelation: "companies"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "receivables_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            suppliers: {
                Row: {
                    cnpj_cpf: string
                    created_at: string | null
                    email: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    phone: string | null
                }
                Insert: {
                    cnpj_cpf: string
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    phone?: string | null
                }
                Update: {
                    cnpj_cpf?: string
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    phone?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            manage_user: {
                Args: {
                    action: string
                    target_user_id: string
                    new_data?: Json
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database["public"]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
