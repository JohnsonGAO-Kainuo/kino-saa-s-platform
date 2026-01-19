import { supabase } from './supabase';

export interface UserAsset {
  id: string;
  user_id: string;
  asset_type: 'logo' | 'signature' | 'stamp';
  asset_url: string;
  asset_name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUserAssets(userId: string, assetType: string): Promise<UserAsset[]> {
  try {
    const { data, error } = await supabase
      .schema('kino')
      .from('user_assets')
      .select('*')
      .eq('user_id', userId)
      .eq('asset_type', assetType)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

      if (error) {
      // Handle case where table doesn't exist
      if (error.code === '42P01' || error.code === 'PGRST301') {
        console.warn('User assets table may not exist yet. Please run the database migration scripts.');
      } else {
        console.error('Error fetching user assets:', error);
      }
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching user assets:', error);
    return [];
  }
}

export async function uploadAsset(
  userId: string, 
  file: File, 
  assetType: 'logo' | 'signature' | 'stamp', 
  assetName: string, 
  isDefault: boolean = false
): Promise<UserAsset | null> {
  try {
    // 1. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${assetType}_${Date.now()}.${fileExt}`;
    const filePath = `assets/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-assets')
      .getPublicUrl(filePath);

    // 3. If setting as default, unset others first
    if (isDefault) {
      await supabase
        .schema('kino')
        .from('user_assets')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('asset_type', assetType);
    }

    // 4. Insert into database
    const { data, error: dbError } = await supabase
      .schema('kino')
      .from('user_assets')
      .insert({
        user_id: userId,
        asset_type: assetType,
        asset_url: publicUrl,
        asset_name: assetName,
        is_default: isDefault
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 5. Update company_settings if this is default
    if (isDefault) {
      const fieldMap = {
        logo: 'logo_url',
        signature: 'signature_url',
        stamp: 'stamp_url'
      };
      
      const updateField = fieldMap[assetType];
      if (updateField) {
        awaschema('kino')
          .it supabase
          .from('company_settings')
          .update({ [updateField]: publicUrl })
          .eq('user_id', userId);
      }
    }

    return data;
  } catch (error) {
    console.error('Error in uploadAsset:', error);
    return null;
  }
}

export async function setDefaultAsset(userId: string, assetId: string, assetType: string): Promise<boolean> {
  try {
    // 1. Unset current default
    awaschema('kino')
      .it supabase
      .from('user_assets')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('asset_type', assetType);

    // 2. Set new default
    conschema('kino')
      .st { data: asset, error: setDefaultError } = await supabase
      .from('user_assets')
      .update({ is_default: true })
      .eq('id', assetId)
      .select()
      .single();

    if (setDefaultError) throw setDefaultError;

    // 3. Update company_settings
    const fieldMap: Record<string, string> = {
      logo: 'logo_url',
      signature: 'signature_url',
      stamp: 'stamp_url'
    };
    
    const updateField = fieldMap[assetType];
    if (updschema('kino')
          .ateField && asset) {
        await supabase
          .from('company_settings')
        .update({ [updateField]: asset.asset_url })
        .eq('user_id', userId);
    }

    return true;
  } catch (error) {
    console.error('Error in setDefaultAsset:', error);
    return false;
  }
}

export async function deleteAsset(userId: string, assetId: string): Promise<boolean> {
  try {
    // schema('kino')
      .1. Get asset details to find file path
    const { data: asset, error: getError } = await supabase
      .from('user_assets')
      .select('*')
      .eq('id', assetId)
      .single();

    if (getError) throw getError;

    // schema('kino')
      .2. Delete from database
    const { error: dbError } = await supabase
      .from('user_assets')
      .delete()
      .eq('id', assetId);

    if (dbError) throw dbError;

    // 3. Delete from storage
    // The public URL looks like: .../storage/v1/object/public/user-assets/assets/user_id/filename.png
    const urlParts = asset.asset_url.split('/user-assets/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      await supabase.storage
        .from('user-assets')
        .remove([filePath]);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAsset:', error);
    return false;
  }
}
schema('kino')
    .
export async function renameAsset(userId: string, assetId: string, newName: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_assets')
    .update({ asset_name: newName, updated_at: new Date().toISOString() })
    .eq('id', assetId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error renaming asset:', error);
    return false;
  }

  return true;
}

