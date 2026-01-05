import { supabase } from './supabase'

export interface UserAsset {
  id: string
  user_id: string
  asset_type: 'logo' | 'signature' | 'stamp'
  asset_url: string
  asset_name: string
  is_default: boolean
  created_at: string
  updated_at: string
}

/**
 * Get all assets of a specific type for the current user
 */
export async function getUserAssets(userId: string, assetType?: 'logo' | 'signature' | 'stamp'): Promise<UserAsset[]> {
  let query = supabase
    .from('user_assets')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (assetType) {
    query = query.eq('asset_type', assetType)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching user assets:', error)
    return []
  }

  return data || []
}

/**
 * Get the default asset for a specific type
 */
export async function getDefaultAsset(userId: string, assetType: 'logo' | 'signature' | 'stamp'): Promise<UserAsset | null> {
  const { data, error } = await supabase
    .from('user_assets')
    .select('*')
    .eq('user_id', userId)
    .eq('asset_type', assetType)
    .eq('is_default', true)
    .single()

  if (error) {
    console.error('Error fetching default asset:', error)
    return null
  }

  return data
}

/**
 * Upload a new asset to Supabase Storage and create a database record
 */
export async function uploadAsset(
  userId: string,
  file: File,
  assetType: 'logo' | 'signature' | 'stamp',
  assetName: string,
  setAsDefault: boolean = false
): Promise<UserAsset | null> {
  try {
    // Upload to Supabase Storage
    const fileName = `${userId}/${assetType}_${Date.now()}.png`
    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(fileName, file, { upsert: true, contentType: 'image/png' })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(fileName)

    // If setting as default, unset other defaults
    if (setAsDefault) {
      await supabase
        .from('user_assets')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('asset_type', assetType)
    }

    // Create database record
    const { data, error } = await supabase
      .from('user_assets')
      .insert({
        user_id: userId,
        asset_type: assetType,
        asset_url: publicUrl,
        asset_name: assetName,
        is_default: setAsDefault,
      })
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error uploading asset:', error)
    return null
  }
}

/**
 * Set an asset as the default for its type
 */
export async function setDefaultAsset(userId: string, assetId: string, assetType: 'logo' | 'signature' | 'stamp'): Promise<boolean> {
  try {
    // Unset all defaults for this type
    await supabase
      .from('user_assets')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('asset_type', assetType)

    // Set the new default
    const { error } = await supabase
      .from('user_assets')
      .update({ is_default: true })
      .eq('id', assetId)
      .eq('user_id', userId)

    if (error) throw error

    return true
  } catch (error) {
    console.error('Error setting default asset:', error)
    return false
  }
}

/**
 * Delete an asset
 */
export async function deleteAsset(userId: string, assetId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_assets')
      .delete()
      .eq('id', assetId)
      .eq('user_id', userId)

    if (error) throw error

    return true
  } catch (error) {
    console.error('Error deleting asset:', error)
    return false
  }
}

/**
 * Rename an asset
 */
export async function renameAsset(userId: string, assetId: string, newName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_assets')
      .update({ asset_name: newName, updated_at: new Date().toISOString() })
      .eq('id', assetId)
      .eq('user_id', userId)

    if (error) throw error

    return true
  } catch (error) {
    console.error('Error renaming asset:', error)
    return false
  }
}

