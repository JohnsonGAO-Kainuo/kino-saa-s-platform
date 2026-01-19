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
      if (error.code === '42P01' || error.code === 'PGRST301') {
        console.warn('User assets table may not exist yet. Please run the database migration scripts.');
      } else {
        console.error('Error fetching user assets:', error);
      }
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching user assets:', err);
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
    const fileExt = file.name.split('.').pop() || 'bin';
    const fileName = `${userId}/${assetType}_${Date.now()}.${fileExt}`;
    const filePath = `assets/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage
      .from('user-assets')
      .getPublicUrl(filePath);

    const publicUrl = (publicData as any)?.publicUrl || '';

    if (isDefault) {
      await supabase
        .schema('kino')
        .from('user_assets')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('asset_type', assetType);
    }

    const { data, error: dbError } = await supabase
      .schema('kino')
      .from('user_assets')
      .insert({
        user_id: userId,
        asset_type: assetType,
        asset_url: publicUrl,
        asset_name: assetName,
        is_default: isDefault,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) throw dbError;

    if (isDefault) {
      const fieldMap: Record<string, string> = {
        logo: 'logo_url',
        signature: 'signature_url',
        stamp: 'stamp_url',
      };

      const updateField = fieldMap[assetType];
      if (updateField) {
        await supabase
          .schema('kino')
          .from('company_settings')
          .update({ [updateField]: publicUrl })
          .eq('user_id', userId);
      }
    }

    return data || null;
  } catch (err) {
    console.error('Error in uploadAsset:', err);
    return null;
  }
}

export async function setDefaultAsset(userId: string, assetId: string, assetType: string): Promise<boolean> {
  try {
    const { error: unsetError } = await supabase
      .schema('kino')
      .from('user_assets')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('asset_type', assetType);

    if (unsetError) throw unsetError;

    const { data: asset, error: setDefaultError } = await supabase
      .schema('kino')
      .from('user_assets')
      .update({ is_default: true })
      .eq('id', assetId)
      .select()
      .single();

    if (setDefaultError) throw setDefaultError;

    const fieldMap: Record<string, string> = {
      logo: 'logo_url',
      signature: 'signature_url',
      stamp: 'stamp_url',
    };

    const updateField = fieldMap[assetType];
    if (updateField && asset) {
      await supabase
        .schema('kino')
        .from('company_settings')
        .update({ [updateField]: asset.asset_url })
        .eq('user_id', userId);
    }

    return true;
  } catch (err) {
    console.error('Error in setDefaultAsset:', err);
    return false;
  }
}

export async function deleteAsset(userId: string, assetId: string): Promise<boolean> {
  try {
    const { data: asset, error: getError } = await supabase
      .schema('kino')
      .from('user_assets')
      .select('*')
      .eq('id', assetId)
      .single();

    if (getError) throw getError;

    const { error: dbError } = await supabase
      .schema('kino')
      .from('user_assets')
      .delete()
      .eq('id', assetId);

    if (dbError) throw dbError;

    const urlParts = (asset as any)?.asset_url?.split('/user-assets/');
    if (urlParts && urlParts.length > 1) {
      const filePath = urlParts[1];
      await supabase.storage.from('user-assets').remove([filePath]);
    }

    return true;
  } catch (err) {
    console.error('Error in deleteAsset:', err);
    return false;
  }
}

export async function renameAsset(userId: string, assetId: string, newName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .schema('kino')
      .from('user_assets')
      .update({ asset_name: newName, updated_at: new Date().toISOString() })
      .eq('id', assetId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error renaming asset:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error renaming asset:', err);
    return false;
  }
}

